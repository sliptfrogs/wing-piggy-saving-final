// lib/api/endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
  },
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
  },
  piggy: {
    list: '/piggy',
    create: '/piggy',
    update: (id: string) => `/piggy/${id}`,
    delete: (id: string) => `/piggy/${id}`,
  },
  transaction: {
    list: '/transactions',
    create: '/transactions',
  },
} as const;
