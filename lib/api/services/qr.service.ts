// lib/api/services/qr.service.ts
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
    const response = await fetch(
      `/api/qr/validate?qrBase64=${encodeURIComponent(qrBase64)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Invalid QR code");
    return data.data; // returns { type, recipientAccountNumber, expiresAt }
  },
};
