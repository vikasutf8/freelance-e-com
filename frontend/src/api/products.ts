import { api } from './client';
import type { PaginatedProducts, Product, ProductPayload } from '../types';

export async function listProducts(
  page = 1,
  limit = 100,
): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', {
    params: { page, limit },
  });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await api.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(
  id: number,
  payload: Partial<ProductPayload>,
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(
  id: number,
): Promise<{ message: string; id: number }> {
  const { data } = await api.delete<{ message: string; id: number }>(
    `/products/${id}`,
  );
  return data;
}
