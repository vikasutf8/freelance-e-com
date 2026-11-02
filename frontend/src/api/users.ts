import { api } from './client';
import type { User, UserRole } from '../types';

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function updateUserRole(id: number, role: UserRole): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, { role });
  return data;
}

export async function deleteUser(
  id: number,
): Promise<{ message: string; id: number }> {
  const { data } = await api.delete<{ message: string; id: number }>(
    `/users/${id}`,
  );
  return data;
}
