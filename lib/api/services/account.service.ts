import {
  PiggyAccountList,
  piggyAccountListSchema,
} from '@/types/piggy-account';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { accountListSchema, Account } from '@/types/account';
import {
  CreatePiggyGoalRequest,
  CreatePiggyGoalResponse,
} from '@/types/create-piggy-account';
import { MainAccount } from '@/types/main-account';

export const accountService = {
  // Returns the main account (first one in the array)
  getMainAccount: async (): Promise<MainAccount> => {
    const data = await apiClient.get<MainAccount>(API_ENDPOINTS.account.main);
    if (!data) {
      throw new Error('No account found');
    }
    return data;
  },

  // If you need the full list (e.g., for an accounts page)
  getAccounts: async (): Promise<Account[]> => {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.account.list);
    return accountListSchema.parse(data);
  },
  getListPiggyAccounts: async (token: string): Promise<PiggyAccountList> => {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.piggy.list, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Raw API response:', data);
    const accounts = piggyAccountListSchema.parse(data); // data is the array from the API

    // Return empty array instead of throwing
    if (!accounts.length) {
      console.log('No piggy accounts found');
      return []; // <-- change this line
    }
    return accounts;
  },
  getAccountByNumberAndType: async (
    token: string,
    accountNumber: string,
    type?: string
  ): Promise<Account> => {
    // Build the URL with optional query parameter
    let url = `${API_ENDPOINTS.account.byNumber}/${accountNumber}`;

    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }

    const account = await apiClient.get<Account>(url, { requiresAuth: true });

    if (!account) {
      throw new Error('Account not found or private');
    }
    return account;
  },
  createPiggyGoal: async (
    token: string,
    data: CreatePiggyGoalRequest
  ): Promise<CreatePiggyGoalResponse> => {
    return apiClient.post<CreatePiggyGoalResponse>(
      API_ENDPOINTS.piggy.create,
      data
    );
  },
};
