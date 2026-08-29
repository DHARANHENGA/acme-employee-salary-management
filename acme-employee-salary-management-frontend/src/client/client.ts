import type { ApiErrorResponse } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public data?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    data?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function httpClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const errorRes = json as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorRes.code || 'UNKNOWN_ERROR',
      errorRes.message || 'An error occurred',
      errorRes.data
    );
  }

  return json as T;
}
