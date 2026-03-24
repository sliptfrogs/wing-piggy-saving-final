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
};
