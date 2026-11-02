import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { timingSafeEqual } from 'crypto';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { parseProductImageDataUrl } from '../common/utils/product-image.util';
import { roundCurrency } from '../common/utils/upi.util';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrdersService } from '../orders/orders.service';
import { Product } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import {
  AdminPaymentResponseDto,
  PaginatedPaymentsResponseDto,
} from './dto/admin-payment-response.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentConfigResponseDto } from './dto/payment-config-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { SubmitPaymentUtrDto } from './dto/submit-payment-utr.dto';
import { UpdatePaymentQrDto } from './dto/update-payment-qr.dto';
import { PaymentSettings } from './entities/payment-settings.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentMode } from './payment-mode';
import {
  PaymentResponseContext,
  toAdminPaymentResponse,
  toPaymentResponse,
} from './payment.mapper';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentSettings)
    private readonly paymentSettingsRepository: Repository<PaymentSettings>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

  async simulate(
    userId: number,
    dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    this.assertMockMode();

    return this.dataSource.transaction(async (manager) => {
      await this.lockUser(manager, userId);

      const cart = await manager.findOne(Cart, {
        where: { id: dto.cartId },
        relations: { items: { product: true } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (cart.userId !== userId) {
        throw new ForbiddenException('You do not own this cart');
      }

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const total = this.calculateTotal(cart.items);

      let payment = await manager.findOne(Payment, {
        where: { cartId: cart.id, status: PaymentStatus.PENDING },
        order: { id: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });

      const upiId =
        dto.upiId ??
        payment?.upiId ??
        this.configService.get<string>('upi.id') ??
        'yourupi@bank';

      if (payment) {
        payment.amount = total;
        payment.upiId = upiId;
        payment = await manager.save(payment);
      } else {
        payment = manager.create(Payment, {
          cartId: cart.id,
          upiId,
          amount: total,
          status: PaymentStatus.PENDING,
        });
        payment = await manager.save(payment);
      }

      const settled = await this.settlePayment(
        manager,
        payment,
        PaymentStatus.SUCCESS,
      );

      return toPaymentResponse(settled, this.paymentContext());
    });
  }

  async submitUtr(
    id: number,
    userId: number,
    dto: SubmitPaymentUtrDto,
  ): Promise<PaymentResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id },
        relations: { cart: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.cart?.userId !== userId) {
        throw new ForbiddenException('You do not own this payment');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        throw new ConflictException('This payment is already confirmed');
      }

      if (payment.status === PaymentStatus.FAILED) {
        throw new ConflictException(
          'This payment was rejected; start a new checkout to retry',
        );
      }

      payment.utr = dto.utr;
      payment.failureReason = null;
      payment.reviewedAt = null;
      payment.reviewedBy = null;

      try {
        const saved = await manager.save(payment);
        return toPaymentResponse(saved, this.paymentContext());
      } catch (error) {
        if (this.isDuplicateError(error)) {
          throw new ConflictException(
            'This UTR is already linked to another payment',
          );
        }
        throw error;
      }
    });
  }

  async confirm(
    id: number,
    adminUserId: number,
  ): Promise<PaymentResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return toPaymentResponse(payment, this.paymentContext());
      }

      if (payment.status === PaymentStatus.FAILED) {
        throw new ConflictException(
          'This payment was already rejected; ask the customer to checkout again',
        );
      }

      if (this.getMode() === 'manual' && !payment.utr) {
        throw new BadRequestException(
          'The customer has not submitted a UTR for this payment yet',
        );
      }

      const settled = await this.settlePayment(
        manager,
        payment,
        PaymentStatus.SUCCESS,
        adminUserId,
      );

      return toPaymentResponse(settled, this.paymentContext());
    });
  }

  async reject(
    id: number,
    adminUserId: number,
    dto: RejectPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        throw new ConflictException('Successful payments cannot be rejected');
      }

      if (payment.status === PaymentStatus.FAILED) {
        return toPaymentResponse(payment, this.paymentContext());
      }

      payment.status = PaymentStatus.FAILED;
      payment.failureReason =
        dto.reason?.trim() || 'The payment could not be verified';
      payment.reviewedAt = new Date();
      payment.reviewedBy = adminUserId;

      const saved = await manager.save(payment);
      return toPaymentResponse(saved, this.paymentContext());
    });
  }

  async findById(
    id: number,
    user: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: { cart: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      payment.cart?.userId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    return toPaymentResponse(payment, this.paymentContext());
  }

  async findAll(
    query: QueryPaymentsDto,
  ): Promise<PaginatedPaymentsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.cart', 'cart')
      .leftJoinAndSelect('cart.user', 'user')
      .leftJoinAndSelect('cart.items', 'item')
      .orderBy('payment.createdAt', 'DESC')
      .addOrderBy('payment.id', 'DESC');

    if (query.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: query.status,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          user.email LIKE :search
          OR CAST(payment.id AS CHAR) LIKE :search
          OR payment.utr LIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    const [payments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const context = this.paymentContext();

    return {
      data: payments.map((payment) =>
        toAdminPaymentResponse(payment, context),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConfig(): Promise<PaymentConfigResponseDto> {
    const settings = await this.findSettings();

    return this.toConfigResponse(settings);
  }

  async updateQrImage(
    adminUserId: number,
    dto: UpdatePaymentQrDto,
  ): Promise<PaymentConfigResponseDto> {
    const image = parseProductImageDataUrl(dto.image);

    await this.paymentSettingsRepository.upsert(
      {
        id: 1,
        qrImageData: image.data,
        qrImageMimeType: image.mimeType,
        qrImageUpdatedAt: new Date(),
        updatedBy: adminUserId,
      },
      ['id'],
    );

    return this.getConfig();
  }

  async removeQrImage(
    adminUserId: number,
  ): Promise<PaymentConfigResponseDto> {
    await this.paymentSettingsRepository.upsert(
      {
        id: 1,
        qrImageData: null,
        qrImageMimeType: null,
        qrImageUpdatedAt: null,
        updatedBy: adminUserId,
      },
      ['id'],
    );

    return this.getConfig();
  }

  async findQrImage(): Promise<{ data: Buffer; mimeType: string }> {
    const settings = await this.paymentSettingsRepository
      .createQueryBuilder('settings')
      .addSelect('settings.qrImageData')
      .where('settings.id = :id', { id: 1 })
      .getOne();

    if (
      !settings?.qrImageData ||
      !settings.qrImageMimeType ||
      !settings.qrImageUpdatedAt
    ) {
      throw new NotFoundException('Payment QR image not uploaded');
    }

    return {
      data: settings.qrImageData,
      mimeType: settings.qrImageMimeType,
    };
  }

  async handleWebhook(
    dto: PaymentWebhookDto,
    secret?: string,
  ): Promise<PaymentResponseDto> {
    this.assertWebhookAuthorized(secret);

    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: dto.paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return toPaymentResponse(payment, this.paymentContext());
      }

      const settled = await this.settlePayment(manager, payment, dto.status);
      return toPaymentResponse(settled, this.paymentContext());
    });
  }

  private async settlePayment(
    manager: EntityManager,
    payment: Payment,
    status: PaymentStatus.SUCCESS | PaymentStatus.FAILED,
    reviewerId?: number,
  ): Promise<Payment> {
    if (status === PaymentStatus.FAILED) {
      if (payment.status === PaymentStatus.SUCCESS) {
        throw new ConflictException('Successful payments cannot be failed');
      }

      if (payment.status === PaymentStatus.FAILED) {
        return payment;
      }

      payment.status = PaymentStatus.FAILED;
      payment.failureReason ??= 'The payment was not completed';
      payment.reviewedAt = new Date();
      payment.reviewedBy = reviewerId ?? null;
      return manager.save(payment);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment;
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw new ConflictException(
        'Payment already failed; create a new checkout to retry',
      );
    }

    const cart = await manager.findOne(Cart, {
      where: { id: payment.cartId },
      relations: { items: { product: true } },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const total = this.calculateTotal(cart.items);

    for (const item of cart.items) {
      const product = await manager.findOne(Product, {
        where: { id: item.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product || product.isDeleted) {
        throw new ConflictException(
          `Product ${item.product?.name ?? item.productId} is no longer available`,
        );
      }

      if (product.stock < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      product.stock -= item.quantity;
      await manager.save(product);
    }

    await this.ordersService.createFromCart(manager, {
      userId: cart.userId,
      paymentId: payment.id,
      total,
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName:
          item.product?.name ?? `Product #${item.productId}`,
        unitPrice: Number(item.priceAtAdd),
        quantity: item.quantity,
        subtotal: roundCurrency(Number(item.priceAtAdd) * item.quantity),
      })),
    });

    await manager.delete(CartItem, { cartId: cart.id });

    payment.amount = total;
    payment.status = PaymentStatus.SUCCESS;
    payment.reviewedAt = new Date();
    payment.reviewedBy = reviewerId ?? null;

    return manager.save(payment);
  }

  private async findSettings(): Promise<PaymentSettings | null> {
    return this.paymentSettingsRepository.findOne({ where: { id: 1 } });
  }

  private toConfigResponse(
    settings: PaymentSettings | null,
  ): PaymentConfigResponseDto {
    const qrImageUrl =
      settings?.qrImageMimeType && settings.qrImageUpdatedAt
        ? `/payments/config/qr?v=${settings.qrImageUpdatedAt.getTime()}`
        : null;

    return {
      upiId: this.configService.get<string>('upi.id') ?? 'yourupi@bank',
      payeeName:
        this.configService.get<string>('upi.payeeName') ?? 'Purelis',
      note:
        this.configService.get<string>('upi.note') ?? 'Order payment',
      mode: this.getMode(),
      qrImageUrl,
    };
  }

  private getMode(): PaymentMode {
    return this.configService.get<PaymentMode>('payments.mode') ?? 'manual';
  }

  private assertMockMode(): void {
    if (this.getMode() !== 'mock') {
      throw new ForbiddenException(
        'Mock payments are disabled. Submit a UTR and wait for the store to verify it.',
      );
    }
  }

  private assertWebhookAuthorized(secret?: string): void {
    const expected =
      this.configService.get<string>('payments.webhookSecret')?.trim() ?? '';

    if (!expected) {
      if (this.getMode() === 'manual') {
        throw new ForbiddenException(
          'Payment webhook is not configured. Set PAYMENT_WEBHOOK_SECRET to enable it.',
        );
      }
      return;
    }

    const provided = secret?.trim() ?? '';

    if (!this.secretMatches(provided, expected)) {
      throw new UnauthorizedException('Invalid payment webhook secret');
    }
  }

  private secretMatches(provided: string, expected: string): boolean {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    return (
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer)
    );
  }

  private paymentContext(): PaymentResponseContext {
    return {
      mode: this.getMode(),
      payeeName: this.configService.get<string>('upi.payeeName'),
      note: this.configService.get<string>('upi.note'),
    };
  }

  private calculateTotal(items: CartItem[]): number {
    const total = items.reduce(
      (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
      0,
    );

    if (total <= 0) {
      throw new BadRequestException('Cart total must be greater than zero');
    }

    return roundCurrency(total);
  }

  private isDuplicateError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === 'ER_DUP_ENTRY'
    );
  }

  private async lockUser(
    manager: EntityManager,
    userId: number,
  ): Promise<User> {
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }
}
