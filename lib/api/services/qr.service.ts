// lib/api/services/qr.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Base URL for QR generation (must be set in .env.local and Vercel)
const QR_API_BASE_URL =
  process.env.API_BASE_URL ||
  'https://wing-final-piggy-saving-api-piggysavingenv.up.railway.app/api/v1';

if (!QR_API_BASE_URL) {
  console.log('API_BASE_URL is not defined');
}

export const qrService = {
  generateQr: async (
    token: string,
    type: 'p2p' | 'contribute' | 'ownTransfer' = 'p2p',
    accountNumber?: string
  ): Promise<Blob> => {
    // Build the URL based on type
    let url: string;
    if (type === 'p2p') {
      url = `${QR_API_BASE_URL}/qr/generate/p2p-transfer-qr`;
    } else if (type === 'contribute') {
      if (!accountNumber) {
        throw new Error('Account number required for contribute QR');
      }
      url = `${QR_API_BASE_URL}/qr/generate/contribute?piggyAccountNumber=${accountNumber}`;
    } else if (type === 'ownTransfer') {
      if (!accountNumber) {
        throw new Error('Account number required for ownTransfer QR');
      }
      url = `${QR_API_BASE_URL}/own-transfer?accountPiggyNumber=${encodeURIComponent(accountNumber)}`;
    } else {
      throw new Error('Invalid QR type');
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `QR generation failed (${response.status}): ${errorText}`
      );
    }

    return response.blob();
  },

  validateQR: async (token: string, qrBase64: string) => {
    const data = await apiClient.get<{
      type: string;
      recipientAccountNumber: string;
      expiresAt: string;
    }>(
      `${API_ENDPOINTS.qr.validate}?qrBase64=${encodeURIComponent(qrBase64)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },
};
