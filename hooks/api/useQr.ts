// hooks/api/useQR.ts
import { qrService } from '@/lib/api/services/qr-generator.service';
import { useQuery } from '@tanstack/react-query';

const fetchQRCodeImage = async (token: string): Promise<string> => {
  const response = await fetch('/api/qr', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const useQRCode = (token?: string) => {
  return useQuery({
    queryKey: ['qrCode', token],
    queryFn: async() => {
      if (!token) {
        throw new Error('Token is required to fetch QR code');
      }
      const blob = await qrService.generateQr(token);
      return URL.createObjectURL(blob);
    },
    enabled: !!token,
    staleTime: Infinity,    

  });
};
