// lib/services/transactionService.ts
import {
  PageResponse,
  TransactionResponseDto,
} from '@/lib/zod/transaction-response';

export const transactionService = {
  getAll: async (
    token: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<TransactionResponseDto>> => {
    const res = await fetch(
      `/api/proxy/transactions/history?page=${page}&size=${size}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Failed to fetch transactions');
    return data.data;
  },

  getByType: async (
    token: string,
    type: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<TransactionResponseDto>> => {
    const res = await fetch(
      `/api/proxy/transactions/history/type?type=${encodeURIComponent(type)}&page=${page}&size=${size}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Failed to fetch transactions by type');
    return data.data;
  },

  getByDateRange: async (
    token: string,
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<TransactionResponseDto>> => {
    const res = await fetch(
      `/api/proxy/transactions/history/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&page=${page}&size=${size}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(
        data.message || 'Failed to fetch transactions by date range'
      );
    return data.data;
  },

  getRecent: async (
    token: string,
    limit = 5
  ): Promise<TransactionResponseDto[]> => {
    const res = await fetch(
      `/api/proxy/transactions/history/recent?limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Failed to fetch recent transactions');
    return data.data;
  },

  getAdminTransactions: async (
    token: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<TransactionResponseDto>> => {
    const res = await fetch(
      `/api/proxy/transactions/admin?page=${page}&size=${size}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch admin transactions');
    }
    return data.data;
  },
};
