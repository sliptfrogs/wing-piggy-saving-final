import { qrService } from '@/lib/api/services/qr.service';
import { transferService } from '@/lib/api/services/transfer.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useQRCode = (
  type: 'p2p' | 'contribute' | 'ownTransfer' = 'p2p',
  accountNumber?: string
) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Only fetch for contribute/ownTransfer if accountNumber is a non‑empty string
  const shouldFetch =
    !!token &&
    (type === 'p2p' || (!!accountNumber && accountNumber.trim() !== ''));

  return useQuery({
    queryKey: ['qrCode', type, accountNumber, token],
    queryFn: async () => {
      if (!token) throw new Error('No access token');
      const blob = await qrService.generateQr(token, type, accountNumber);
      return URL.createObjectURL(blob);
    },
    enabled: shouldFetch,
    staleTime: Infinity,
  });
};

export const useQRValidation = (qrBase64: string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ['qr', 'validate', qrBase64],
    queryFn: () => qrService.validateQR(token!, qrBase64),
    enabled: !!token && !!qrBase64,
    retry: false,
    staleTime: 0, // never cache
  });
};

export const useQrTransfer = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrBase64,
      amount,
      notes,
    }: {
      qrBase64: string;
      amount: number;
      notes?: string;
    }) => {
      if (!session?.accessToken) throw new Error('No access token');
      return transferService.processQR(
        session.accessToken,
        qrBase64,
        amount,
        notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
