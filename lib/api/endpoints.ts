import { get } from "http";

// lib/api/endpoints.ts
const baseUrl =
  process.env.API_BASE_URL ||
  'https://wing-final-piggy-saving-api-piggysavingenv.up.railway.app/api/v1';
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
    main: '/accounts/main',
    list: '/accounts',
    list_piggys: '/accounts/piggy-account',
    byNumber: '/accounts',
  },
  piggy: {
    list: '/piggy',
    create: '/piggy',
    get_by_accountNumber: (accountNumber: string) =>
      `/piggy/by-account/${accountNumber}`,
    update_public: (accountNumber: string) => `/piggy/${accountNumber}`,
    delete: (id: string) => `/piggy/${id}`,
    get_by_user_and_status: (status: string) => `/piggy/by-status/${status}`,
  },
  transaction: {
    history: '/transactions/history',
    byType: '/transactions/history/type',
    byDateRange: '/transactions/history/date-range',
    recent: '/transactions/history/recent',
  },
  qr: {
    generate: '/qr/generate/p2p-transfer-qr',
    validate: '/qr/validate',
    process: `${baseUrl}/qr-transfers/process`,
  },
  transfers: {
    p2p: '/transfers/p2p',
    contribute: '/transfers/contribute',
    own_piggy: '/transfers/main-to-piggy',
    break_piggy: '/transfers/break-piggy',
  },
  notification: {
    list: '/notifications',
    unreadCount: '/notifications/unread/count',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
  },
} as const;
