import { api } from './client';
import type {
  PaginatedPayments,
  Payment,
  PaymentConfig,
  PaymentStatus,
} from '../types';

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  search?: string;
}

export async function simulatePayment(
  cartId: number,
  upiId?: string,
): Promise<Payment> {
  const { data } = await api.post<Payment>('/payments', { cartId, upiId });
  return data;
}

export async function getPayment(id: number): Promise<Payment> {
  const { data } = await api.get<Payment>(`/payments/${id}`);
  return data;
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const { data } = await api.get<PaymentConfig>('/payments/config');
  return data;
}

export async function uploadPaymentQr(image: string): Promise<PaymentConfig> {
  const { data } = await api.put<PaymentConfig>('/payments/config/qr', {
    image,
  });
  return data;
}

export async function removePaymentQr(): Promise<PaymentConfig> {
  const { data } = await api.delete<PaymentConfig>('/payments/config/qr');
  return data;
}

export async function submitPaymentUtr(
  id: number,
  utr: string,
): Promise<Payment> {
  const { data } = await api.post<Payment>(`/payments/${id}/utr`, { utr });
  return data;
}

export async function listPayments(
  params: ListPaymentsParams = {},
): Promise<PaginatedPayments> {
  const { data } = await api.get<PaginatedPayments>('/payments', { params });
  return data;
}

export async function confirmPayment(id: number): Promise<Payment> {
  const { data } = await api.post<Payment>(`/payments/${id}/confirm`);
  return data;
}

export async function rejectPayment(
  id: number,
  reason?: string,
): Promise<Payment> {
  const { data } = await api.post<Payment>(`/payments/${id}/reject`, {
    reason,
  });
  return data;
}
