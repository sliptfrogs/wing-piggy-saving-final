'use client';

import { signIn } from 'next-auth/react';
import { useApi } from './useApi';
import { authService } from '@/lib/api/services/auth.service';
import type { RegisterRequest } from '@/lib/api/types';

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<unknown>;
  verifyOtp: (email: string, otpCode: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const { loading, error, execute } = useApi();

  const login = async (email: string, password: string): Promise<void> => {
    await execute(
      async () => {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          throw new Error(result.error);
        }
      },
      { showErrorToast: true, showSuccessToast: false }
    );
  };

  const register = async (data: RegisterRequest) => {
    return execute(() => authService.register(data), { showErrorToast: true });
  };

  const verifyOtp = async (email: string, otpCode: string): Promise<void> => {
    await execute(
      async () => {
        const result = await signIn('otp', {
          email,
          otpCode,
          redirect: false,
        });
        if (result?.error) {
          throw new Error(result.error);
        }
      },
      { showErrorToast: true, showSuccessToast: false }
    );
  };

  const resendOtp = async (email: string): Promise<void> => {
    await execute(() => authService.resendOtp(email), {
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: 'OTP resent!',
    });
  };

  return {
    login,
    register,
    verifyOtp,
    resendOtp,
    loading,
    error,
  };
}
