import { api } from './client';
import type { Cart, Payment } from '../types';

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>('/cart');
  return data;
}

export async function addCartItem(
  productId: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await api.post<Cart>('/cart/items', { productId, quantity });
  return data;
}

export async function updateCartItem(
  itemId: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
  return data;
}

export async function checkout(): Promise<Payment> {
  const { data } = await api.post<Payment>('/cart/checkout');
  return data;
}
