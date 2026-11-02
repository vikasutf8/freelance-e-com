import axios from 'axios';
import type { ApiError } from '../types';

export function getApiError(error: unknown): ApiError | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as Partial<ApiError> | undefined;
  if (!data || typeof data.message !== 'string') return null;
  return {
    statusCode: data.statusCode ?? error.response?.status ?? 500,
    message: data.message,
    errors: Array.isArray(data.errors) ? data.errors : [],
  };
}

export function getApiErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }
  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  const apiError = getApiError(error);
  if (apiError) {
    if (apiError.errors.length > 0) return apiError.errors.join(' ');
    return apiError.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getFieldError(
  error: unknown,
  field: string,
): string | undefined {
  const apiError = getApiError(error);
  return apiError?.errors.find((item) =>
    item.toLowerCase().startsWith(field.toLowerCase()),
  );
}
