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
  account: {
    main: '/accounts/my-accounts/MAIN',
    list: '/accounts',
    list_piggys: '/accounts/piggy-account',
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
  qr: {
    generate: '/qr/generate/p2p-transfer-qr'
  }
} as const;
