import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { buildProductImageUrl } from '../common/utils/product-image.util';
import { roundCurrency } from '../common/utils/upi.util';
import { toPaymentResponse } from '../payments/payment.mapper';
import type { PaymentMode } from '../payments/payment-mode';
import { PaymentResponseDto } from '../payments/dto/payment-response.dto';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async getCart(userId: number): Promise<CartResponseDto> {
    const userExists = await this.cartRepository.manager.existsBy(User, {
      id: userId,
    });

    if (!userExists) {
      throw new UnauthorizedException('User no longer exists');
    }

    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      try {
        cart = await this.cartRepository.save(
          this.cartRepository.create({ userId }),
        );
      } catch (error) {
        if (!this.isDuplicateError(error)) {
          throw error;
        }
        cart = await this.cartRepository.findOne({
          where: { userId },
          relations: { items: { product: true } },
        });
      }
    }

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toCartResponse(cart);
  }

  async addItem(
    userId: number,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      await this.lockUser(manager, userId);

      const product = await manager.findOne(Product, {
        where: { id: dto.productId, isDeleted: false },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let cart = await manager.findOne(Cart, { where: { userId } });

      if (!cart) {
        cart = manager.create(Cart, { userId });
        cart = await manager.save(cart);
      }

      const existingItem = await manager.findOne(CartItem, {
        where: { cartId: cart.id, productId: product.id },
      });

      const totalQuantity = (existingItem?.quantity ?? 0) + dto.quantity;

      if (product.stock < totalQuantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      if (existingItem) {
        existingItem.quantity = totalQuantity;
        await manager.save(existingItem);
      } else {
        const newItem = manager.create(CartItem, {
          cartId: cart.id,
          productId: product.id,
          quantity: dto.quantity,
          priceAtAdd: product.price,
        });
        await manager.save(newItem);
      }

      return this.buildCartResponse(manager, cart.id);
    });
  }

  async updateItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      await this.lockUser(manager, userId);

      const cart = await manager.findOne(Cart, { where: { userId } });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = await manager.findOne(CartItem, {
        where: { id: itemId, cartId: cart.id },
      });

      if (!item) {
        throw new NotFoundException('Cart item not found');
      }

      const product = await manager.findOne(Product, {
        where: { id: item.productId, isDeleted: false },
      });

      if (!product) {
        throw new BadRequestException('Product is no longer available');
      }

      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      item.quantity = dto.quantity;
      await manager.save(item);

      return this.buildCartResponse(manager, cart.id);
    });
  }

  async removeItem(
    userId: number,
    itemId: number,
  ): Promise<CartResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      await this.lockUser(manager, userId);

      const cart = await manager.findOne(Cart, { where: { userId } });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = await manager.findOne(CartItem, {
        where: { id: itemId, cartId: cart.id },
      });

      if (!item) {
        throw new NotFoundException('Cart item not found');
      }

      await manager.remove(item);

      return this.buildCartResponse(manager, cart.id);
    });
  }

  async checkout(userId: number): Promise<PaymentResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      await this.lockUser(manager, userId);

      const cart = await manager.findOne(Cart, {
        where: { userId },
        relations: { items: { product: true } },
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      for (const item of cart.items) {
        const product = item.product;

        if (!product || product.isDeleted) {
          throw new BadRequestException(
            `Product ${item.productId} is no longer available`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          );
        }
      }

      const total = roundCurrency(
        cart.items.reduce(
          (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
          0,
        ),
      );

      if (total <= 0) {
        throw new BadRequestException('Cart total must be greater than zero');
      }

      const upiId =
        this.configService.get<string>('upi.id') ?? 'yourupi@bank';

      let payment = await manager.findOne(Payment, {
        where: { cartId: cart.id, status: PaymentStatus.PENDING },
        order: { id: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });

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

      return toPaymentResponse(payment, {
        mode:
          this.configService.get<PaymentMode>('payments.mode') ?? 'mock',
        payeeName: this.configService.get<string>('upi.payeeName'),
        note: this.configService.get<string>('upi.note'),
      });
    });
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

  private async buildCartResponse(
    manager: EntityManager,
    cartId: number,
  ): Promise<CartResponseDto> {
    const cart = await manager.findOne(Cart, {
      where: { id: cartId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toCartResponse(cart);
  }

  private toCartResponse(cart: Cart): CartResponseDto {
    const items = (cart.items ?? [])
      .map((item) => {
        const priceAtAdd = Number(item.priceAtAdd);
        const product = item.product;

        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtAdd,
          subtotal: roundCurrency(priceAtAdd * item.quantity),
          product: {
            id: product?.id ?? item.productId,
            name: product?.name ?? 'Unavailable product',
            price: Number(product?.price ?? 0),
            description: product?.description ?? null,
            imageUrl: product ? buildProductImageUrl(product) : null,
            stock: product?.stock ?? 0,
          },
        };
      })
      .sort((a, b) => a.id - b.id);

    return {
      id: cart.id,
      items,
      total: roundCurrency(
        items.reduce((sum, item) => sum + item.subtotal, 0),
      ),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  private isDuplicateError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === 'ER_DUP_ENTRY'
    );
  }
}
