import { Order, OrderStatus } from './entities/order.entity';
import { toOrderResponse } from './order.mapper';

describe('toOrderResponse', () => {
  it('maps the immutable order snapshot and item count', () => {
    const order = {
      id: 18,
      userId: 4,
      paymentId: 7,
      total: 1298,
      status: OrderStatus.PAID,
      createdAt: new Date('2026-11-01T10:30:00.000Z'),
      user: { email: 'member@example.com' },
      items: [
        {
          id: 22,
          productId: 3,
          productName: 'Calming Green Tea Face Wash',
          unitPrice: 649,
          quantity: 2,
          subtotal: 1298,
        },
      ],
    } as Order;

    expect(toOrderResponse(order)).toEqual({
      id: 18,
      userId: 4,
      customerEmail: 'member@example.com',
      paymentId: 7,
      total: 1298,
      status: OrderStatus.PAID,
      itemCount: 2,
      createdAt: order.createdAt,
      items: [
        {
          id: 22,
          productId: 3,
          productName: 'Calming Green Tea Face Wash',
          unitPrice: 649,
          quantity: 2,
          subtotal: 1298,
        },
      ],
    });
  });
});
