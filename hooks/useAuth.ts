// hooks/api/useAuth.ts – example using the above
import { RegisterRequest } from '@/lib/api/types';
import { useApi } from './useApi';
import { authService } from '@/lib/api/services/auth.service';

export function useAuth() {
  const { execute, loading, error } = useApi();

  const login = (email: string, password: string) =>
    execute(() => authService.login({ email, password }), { showErrorToast: true });

  const register = (data: RegisterRequest) =>
    execute(() => authService.register(data));

  const verifyOtp = (email: string, otpCode: string) =>
    execute(() => authService.verifyOtp({ email, otpCode }));

  const resendOtp = (email: string) =>
    execute(() => authService.resendOtp(email));

  return { login, register, verifyOtp, resendOtp, loading, error };
}
