import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserRole } from '../users/entities/user.entity';
import {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { toOrderResponse } from './order.mapper';

interface OrderItemSnapshot {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface CreateOrderInput {
  userId: number;
  paymentId: number;
  total: number;
  items: OrderItemSnapshot[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async createFromCart(
    manager: EntityManager,
    input: CreateOrderInput,
  ): Promise<Order> {
    const order = manager.create(Order, {
      userId: input.userId,
      paymentId: input.paymentId,
      total: input.total,
      status: OrderStatus.PAID,
    });
    const savedOrder = await manager.save(order);

    const items = await manager.save(
      OrderItem,
      input.items.map((item) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        }),
      ),
    );

    savedOrder.items = items;
    return savedOrder;
  }

  async findAll(
    user: AuthenticatedUser,
    query: QueryOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'item')
      .leftJoinAndSelect('o.user', 'user')
      .orderBy('o.createdAt', 'DESC')
      .addOrderBy('o.id', 'DESC');

    if (user.role !== UserRole.ADMIN) {
      queryBuilder.andWhere('o.userId = :userId', { userId: user.userId });
    }

    if (query.status) {
      queryBuilder.andWhere('o.status = :status', { status: query.status });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          user.email LIKE :search
          OR CAST(o.id AS CHAR) LIKE :search
          OR item.productName LIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    const [orders, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: orders.map(toOrderResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: number,
    user: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== UserRole.ADMIN && order.userId !== user.userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return toOrderResponse(order);
  }
}
