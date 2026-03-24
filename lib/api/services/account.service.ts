import {
  PiggyAccountList,
  piggyAccountListSchema,
} from "@/types/piggy-account";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { accountListSchema, Account } from "@/types/account";

export const accountService = {
  // Returns the main account (first one in the array)
  getMainAccount: async (): Promise<Account> => {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.account.main);
    const accounts = accountListSchema.parse(data); // data is the array from the API
    if (!accounts.length) {
      throw new Error("No account found");
    }
    // If you have multiple accounts and need the one with type "MAIN":
    // const mainAccount = accounts.find(acc => acc.account_type === 'MAIN');
    // if (!mainAccount) throw new Error('Main account not found');
    // return mainAccount;
    return accounts[0];
  },

  // If you need the full list (e.g., for an accounts page)
  getAccounts: async (): Promise<Account[]> => {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.account.list);
    return accountListSchema.parse(data);
  },
  getListPiggyAccounts: async (token: string): Promise<PiggyAccountList> => {
    const data = await apiClient.get<unknown>(
      API_ENDPOINTS.account.list_piggys,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("Raw API response:", data);
    const accounts = piggyAccountListSchema.parse(data); // data is the array from the API

    // Return empty array instead of throwing
    if (!accounts.length) {
      console.log("No piggy accounts found");
      return []; // <-- change this line
    }
    return accounts;
  },
  getAccountByNumberAndType: async (
    token: string,
    accountNumber: string,
    type?: string,
  ): Promise<Account> => {
    // Build the URL with optional query parameter
    let url = `${API_ENDPOINTS.account.byNumber}/${accountNumber}`;

    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }

    const account = await apiClient.get<Account>(url, { requiresAuth: true });

    if (!account) {
      throw new Error("Account not found or private");
    }
    return account;
  },
};
