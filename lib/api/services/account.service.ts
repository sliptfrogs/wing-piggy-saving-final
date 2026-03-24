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
    try {
      const data = await apiClient.get<unknown>(
        API_ENDPOINTS.account.list_piggys,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Raw API response:", data);
      console.log("Response type:", typeof data);
      console.log("Is array?", Array.isArray(data));

      // Try to parse and catch the error
      try {
        const accounts = piggyAccountListSchema.parse(data);
        console.log("Parsed accounts:", accounts);

        if (!accounts.length) {
          throw new Error("No account found");
        }
        return accounts;
      } catch (parseError) {
        console.error("Zod parsing error:", parseError);
        console.error("Error details:", JSON.stringify(parseError, null, 2));
        throw new Error(`Data validation failed: ${parseError.message}`);
      }
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },
  
};
