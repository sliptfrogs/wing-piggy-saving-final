import { API_ENDPOINTS } from "../endpoints";

export const qrService = {
  /**
   * Generate P2P QR code via proxy to avoid CORS
   * @param token - Access token from session
   * @returns Promise<Blob> - QR code image blob
   */
  generateQr: async (token: string): Promise<Blob> => {
    const response = await fetch('/api/qr', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    return response.blob();
  },
};
