import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { accountService } from '@/lib/api/services/account.service'; // adjust import

export const useAccountLookup = (accountNumber: string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  return useQuery({
    queryKey: ['account', 'lookup', accountNumber, token],
    queryFn: () => accountService.getAccountByNumber(token!, accountNumber),
    enabled: !!token && !!accountNumber,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
