import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../client';

import {
  ContributeTransferRequest,
  ContributeTransferResponse,
} from '@/types/contribute-transfer';
import { P2PTransferRequest, P2PTransferResponse } from '@/types/p2p-transfer';
import {
  OwnPiggyTransferRequest,
  OwnPiggyTransferResponse,
} from '@/types/own-piggy-transfer';
import { BreakPiggyRequest, BreakPiggyResponse } from '@/types/break-piggy';

export const transferService = {
  processQR: async (
    token: string,
    qrBase64: string,
    amount: number,
    notes?: string
  ) => {
    const response = await fetch(API_ENDPOINTS.qr.process, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_base64_data: qrBase64,
        amount,
        notes: notes || '',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      // Log the full error details
      console.error('Transfer process failed:', {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
      throw new Error(data.message || `Transfer failed (${response.status})`);
    }
    return data;
  },
  p2pTransfer: async (
    data: P2PTransferRequest
  ): Promise<P2PTransferResponse> => {
    return apiClient.post<P2PTransferResponse>(
      API_ENDPOINTS.transfers.p2p,
      data
    );
  },
  contributeTransfer: async (
    data: ContributeTransferRequest
  ): Promise<ContributeTransferResponse> => {
    return apiClient.post<ContributeTransferResponse>(
      API_ENDPOINTS.transfers.contribute,
      data
    );
  },
  ownPiggyTransfer: async (
    data: OwnPiggyTransferRequest
  ): Promise<OwnPiggyTransferResponse> => {
    return apiClient.post<OwnPiggyTransferResponse>(
      API_ENDPOINTS.transfers.own_piggy,
      data
    );
  },
  breakPiggy: async (data: BreakPiggyRequest): Promise<BreakPiggyResponse> => {
    return apiClient.post<BreakPiggyResponse>(
      API_ENDPOINTS.transfers.break_piggy,
      data
    );
  },
};
