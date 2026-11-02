import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { OrderStatus } from '../entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({
    type: Number,
    example: 3,
    nullable: true,
    description: 'Null when the product has since been permanently removed.',
  })
  productId: number | null;

  @ApiProperty({ example: 'Calming Green Tea Face Wash' })
  productName: string;

  @ApiProperty({ example: 649 })
  unitPrice: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1298 })
  subtotal: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 18 })
  id: number;

  @ApiProperty({ example: 4 })
  userId: number;

  @ApiProperty({
    type: String,
    example: 'member@example.com',
    nullable: true,
  })
  customerEmail: string | null;

  @ApiProperty({ example: 7 })
  paymentId: number;

  @ApiProperty({ example: 1298 })
  total: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PAID })
  status: OrderStatus;

  @ApiProperty({ example: 2 })
  itemCount: number;

  @ApiProperty({ example: '2026-11-01T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: () => [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: () => [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
