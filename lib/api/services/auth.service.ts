// lib/api/services/auth.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
} from '../types';

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data, {
      requiresAuth: false,
    }),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post<RegisterResponse>(API_ENDPOINTS.auth.register, data, {
      requiresAuth: false,
    }),

  verifyOtp: (data: VerifyOtpRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.auth.verifyOtp, data, {
      requiresAuth: false,
    }),

  resendOtp: (email: string): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resendOtp,
      { email },
      { requiresAuth: false }
    ),

  logout: (): Promise<void> => apiClient.post(API_ENDPOINTS.auth.logout),

  refreshToken: (refreshToken: string): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.refreshToken,
      {
        refresh_token: refreshToken,
      },
      {
        requiresAuth: false,
      }
    ),
};
