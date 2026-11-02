import { OrderResponseDto } from './dto/order-response.dto';
import { Order } from './entities/order.entity';

export function toOrderResponse(order: Order): OrderResponseDto {
  const items = (order.items ?? [])
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    }))
    .sort((a, b) => a.id - b.id);

  return {
    id: order.id,
    userId: order.userId,
    customerEmail: order.user?.email ?? null,
    paymentId: order.paymentId,
    total: Number(order.total),
    status: order.status,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    items,
  };
}
