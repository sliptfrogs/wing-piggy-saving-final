import { qrService } from '@/lib/api/services/qr.service';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';


export const useQRCode = (
  type: 'p2p' | 'contribute' | 'ownTransfer' = 'p2p',
  accountNumber?: string
) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ['qrCode', type, accountNumber, token],
    queryFn: async () => {
      if (!token) throw new Error('No access token');
      const blob = await qrService.generateQr(token, type, accountNumber);
      return URL.createObjectURL(blob);
    },
    enabled: !!token,
    staleTime: Infinity,
    // placeholderData: (previousData) => previousData,
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
