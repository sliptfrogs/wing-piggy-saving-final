// lib/api/services/qr.service.ts
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const qrService = {
  generateQr: async (
    token: string,
    type: "p2p" | "contribute" | "ownTransfer" = "p2p",
    accountNumber?: string,
  ): Promise<Blob> => {
    let url = `/api/qr?type=${type}`;
    if ((type === "contribute" || type === "ownTransfer") && accountNumber) {
      url += `&accountNumber=${encodeURIComponent(accountNumber)}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch QR");
    return response.blob();
  },

  // New method: validate QR code before proceeding to amount input
  // lib/api/services/qr.service.ts (add this method)
  validateQR: async (token: string, qrBase64: string) => {
    const data = await apiClient.get<{ type: string; recipientAccountNumber: string; expiresAt: string }>(
        `${API_ENDPOINTS.qr.validate}?qrBase64=${encodeURIComponent(qrBase64)}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return data; // already unwrapped
},
};
