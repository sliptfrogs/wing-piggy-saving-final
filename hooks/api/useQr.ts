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
