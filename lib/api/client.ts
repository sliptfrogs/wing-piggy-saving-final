import { getSession } from 'next-auth/react';

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  code?: string;
  path?: string;
  timestamp?: string;

  constructor(
    status: number,
    message: string,
    code?: string,
    path?: string,
    timestamp?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.path = path;
    this.timestamp = timestamp;
  }
}

// Base HTTP client
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const session = await getSession();
      return session?.accessToken || null;
    } catch {
      return null;
    }
  }

  private async getHeaders(
    requiresAuth: boolean = true
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (requiresAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { requiresAuth?: boolean } = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(requiresAuth);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...(fetchOptions.headers as Record<string, string>),
        },
      });

      // Parse response body as JSON (or fallback to text)
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Extract error details from the response
        let errorMessage = `HTTP ${response.status}`;
        let errorCode: string | undefined;
        let errorPath: string | undefined;
        let errorTimestamp: string | undefined;

        if (data && typeof data === 'object') {
          const errorObj = data as Record<string, unknown>;
          errorMessage =
            (errorObj.message as string) ||
            (errorObj.error as string) ||
            errorMessage;
          errorCode = errorObj.code as string;
          errorPath = errorObj.path as string;
          errorTimestamp = errorObj.timestamp as string;
        }

        throw new ApiError(
          response.status,
          errorMessage,
          errorCode,
          errorPath,
          errorTimestamp
        );
      }

      // Process different response formats from Spring Boot
      if (data && typeof data === 'object') {
        const responseObj = data as Record<string, unknown>;

        // Format: { success: true, data: {...}, status_code: 200 }
        if ('success' in responseObj) {
          if (responseObj.success === false) {
            throw new ApiError(
              (responseObj.status_code as number) || 400,
              (responseObj.message as string) || 'Request failed',
              responseObj.error as string
            );
          }
          return (responseObj.data as T) ?? (data as T);
        }

        // Format: { status: "SUCCESS", data: {...} }
        if ('status' in responseObj && responseObj.status === 'SUCCESS') {
          return (responseObj.data as T) ?? (data as T);
        }
      }

      // Fallback: return the whole response object
      return data as T;
    } catch (error) {
      // Re‑throw our custom errors; wrap network errors
      if (error instanceof ApiError) {
        throw error;
      }
      if (
        error instanceof Error &&
        error.name === 'TypeError' &&
        error.message === 'Failed to fetch'
      ) {
        throw new ApiError(
          0,
          'Network error. Please check your connection.',
          'NETWORK_ERROR'
        );
      }
      // Wrap unexpected errors
      throw new ApiError(500, (error as Error).message || 'Unknown error');
    }
  }

  // HTTP methods
  get<T>(
    endpoint: string,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(
    endpoint: string,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
