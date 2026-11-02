import { buildUpiLink } from '../common/utils/upi.util';
import { AdminPaymentResponseDto } from './dto/admin-payment-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { Payment } from './entities/payment.entity';
import { PaymentMode } from './payment-mode';

export interface PaymentResponseContext {
  mode: PaymentMode;
  payeeName?: string;
  note?: string;
}

export function toPaymentResponse(
  payment: Payment,
  context: PaymentResponseContext,
): PaymentResponseDto {
  const amount = Number(payment.amount);

  return {
    id: payment.id,
    cartId: payment.cartId,
    upiId: payment.upiId,
    amount,
    status: payment.status,
    createdAt: payment.createdAt,
    upiLink: buildUpiLink(payment.upiId, amount, {
      payeeName: context.payeeName,
      note: context.note,
    }),
    utr: payment.utr ?? null,
    failureReason: payment.failureReason ?? null,
    reviewedAt: payment.reviewedAt ?? null,
    mode: context.mode,
  };
}

export function toAdminPaymentResponse(
  payment: Payment,
  context: PaymentResponseContext,
): AdminPaymentResponseDto {
  const itemCount = (payment.cart?.items ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return {
    ...toPaymentResponse(payment, context),
    userId: payment.cart?.userId ?? 0,
    customerEmail: payment.cart?.user?.email ?? null,
    itemCount,
  };
}
