import { api } from './client';
import type { Order, PaginatedOrders } from '../types';

export async function listOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedOrders> {
  const { data } = await api.get<PaginatedOrders>('/orders', { params });
  return data;
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}
