import { accountService } from "@/lib/api/services/account.service";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const accountKeys = {
  all: ["account"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

/**
 * Query hooks main account
 */
// hooks/api/useAccount.ts
export const useMainAccount = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ["account", "main", token],
    queryFn: () => accountService.getMainAccount(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch List piggy accounts
 * @returns List Piggy
 */
export function useListPiggyAccounts() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ["piggy-accounts", token],
    queryFn: async () => {
      // This runs only when the query is enabled (token exists)
      if (!token) {
        throw new Error("No access token found in session");
      }
      return accountService.getListPiggyAccounts(token);
    },
    enabled: !!token && status === "authenticated",
  });
}

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getMainAccount(),
  });
};
