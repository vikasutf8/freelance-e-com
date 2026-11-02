import { API_BASE_URL } from '../api/client';

export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}
