import { api } from './client';
import type { AuthResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
