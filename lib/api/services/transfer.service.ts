import { API_ENDPOINTS } from "../endpoints";
import { apiClient } from "../client";

import {
  ContributeTransferRequest,
  ContributeTransferResponse,
} from "@/types/contribute-transfer";
import { P2PTransferRequest, P2PTransferResponse } from "@/types/p2p-transfer";
import {
  OwnPiggyTransferRequest,
  OwnPiggyTransferResponse,
} from "@/types/own-piggy-transfer";

export const transferService = {
  processQR: async (
    token: string,
    qrBase64: string,
    amount: number,
    notes?: string,
  ) => {
    const response = await fetch("/api/transfer/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qr_base64_data: qrBase64,
        amount,
        notes: notes || "",
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Transfer failed");
    return data;
  },
  p2pTransfer: async (
    data: P2PTransferRequest,
  ): Promise<P2PTransferResponse> => {
    return apiClient.post<P2PTransferResponse>(
      API_ENDPOINTS.transfers.p2p,
      data,
    );
  },
  contributeTransfer: async (
    data: ContributeTransferRequest,
  ): Promise<ContributeTransferResponse> => {
    return apiClient.post<ContributeTransferResponse>(
      API_ENDPOINTS.transfers.contribute,
      data,
    );
  },
  ownPiggyTransfer: async (
    data: OwnPiggyTransferRequest,
  ): Promise<OwnPiggyTransferResponse> => {
    return apiClient.post<OwnPiggyTransferResponse>(
      API_ENDPOINTS.transfers.own_piggy,
      data,
    );
  },
};
