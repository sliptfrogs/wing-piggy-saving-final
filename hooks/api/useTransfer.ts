import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { transferService } from '@/lib/api/services/transfer.service';

export const useTransfer = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ qrBase64, amount, notes }: { qrBase64: string; amount: number; notes?: string }) => {
      if (!session?.accessToken) throw new Error('No access token');
      return transferService.processQR(session.accessToken, qrBase64, amount, notes);
    },
    onSuccess: () => {
      // Invalidate all queries that depend on account or transaction data
      queryClient.invalidateQueries({ queryKey: ['account'] });     // e.g., useMainAccount
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // transaction list
      queryClient.invalidateQueries({ queryKey: ['balance'] });      // if separate
    },
    onError: (error) => {
      console.error('Transfer mutation error:', error);
    },
  });
};
