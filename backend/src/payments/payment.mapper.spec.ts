import { toPaymentResponse } from './payment.mapper';
import { Payment, PaymentStatus } from './entities/payment.entity';

describe('toPaymentResponse', () => {
  it('maps a payment and includes the UPI link', () => {
    const payment = {
      id: 7,
      cartId: 4,
      upiId: 'yourupi@bank',
      amount: 4999.98,
      status: PaymentStatus.PENDING,
      createdAt: new Date('2026-01-15T10:30:00.000Z'),
      utr: '123456789012',
      failureReason: null,
      reviewedAt: null,
    } as Payment;

    expect(
      toPaymentResponse(payment, {
        mode: 'manual',
        payeeName: 'Purelis',
        note: 'Order payment',
      }),
    ).toEqual({
      id: 7,
      cartId: 4,
      upiId: 'yourupi@bank',
      amount: 4999.98,
      status: PaymentStatus.PENDING,
      createdAt: payment.createdAt,
      upiLink:
        'upi://pay?pa=yourupi@bank&am=4999.98&cu=INR&pn=Purelis&tn=Order+payment',
      utr: '123456789012',
      failureReason: null,
      reviewedAt: null,
      mode: 'manual',
    });
  });
});
