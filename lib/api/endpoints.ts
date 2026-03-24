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
    byNumber: '/accounts'
  },
  piggy: {
    list: '/piggy',
    create: '/piggy',
    update: (id: string) => `/piggy/${id}`,
    delete: (id: string) => `/piggy/${id}`,
  },
  transaction: {
    history: '/transactions/history',
    byType: '/transactions/history/type',
    byDateRange: '/transactions/history/date-range',
    recent: '/transactions/history/recent',
  },
  qr: {
    generate: '/qr/generate/p2p-transfer-qr'
  },
  transfers: {
    p2p: '/transfers/p2p',
    contribute: '/transfers/contribute'
  }
} as const;
