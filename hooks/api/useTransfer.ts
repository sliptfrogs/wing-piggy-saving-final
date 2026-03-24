import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { transferService } from "@/lib/api/services/transfer.service";
import { P2PTransferRequest, P2PTransferResponse } from "@/types/p2p-transfer";
import { ContributeTransferRequest } from "@/types/contribute-transfer";
import { OwnPiggyTransferRequest, OwnPiggyTransferResponse } from "@/types/own-piggy-transfer";

export const useTransfer = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrBase64,
      amount,
      notes,
    }: {
      qrBase64: string;
      amount: number;
      notes?: string;
    }) => {
      if (!session?.accessToken) throw new Error("No access token");
      return transferService.processQR(
        session.accessToken,
        qrBase64,
        amount,
        notes,
      );
    },
    onSuccess: () => {
      // Invalidate all queries that depend on account or transaction data
      queryClient.invalidateQueries({ queryKey: ["account"] }); // e.g., useMainAccount
      queryClient.invalidateQueries({ queryKey: ["transactions"] }); // transaction list
      queryClient.invalidateQueries({ queryKey: ["balance"] }); // if separate
    },
    onError: (error) => {
      console.error("Transfer mutation error:", error);
    },
  });
};

export const useTransferByP2P = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: P2PTransferRequest) => transferService.p2pTransfer(data),
    onSuccess: (data: P2PTransferResponse) => {
      // Invalidate queries that depend on account and transaction data
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Optional: update specific queries optimistically
    },
  });
};
/**
 * @method useTransferContribute
 * @description Custom hook to handle contribution transfers. Uses React Query's useMutation to call the contributeTransfer API and invalidates relevant queries on success.
 * @returns
 */
export const useTransferContribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ContributeTransferRequest) => transferService.contributeTransfer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['account'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};

export const useTransferOwnPiggy = () => {
    const queryClient = useQueryClient();

    return useMutation<OwnPiggyTransferResponse, Error, OwnPiggyTransferRequest>({
        mutationFn: (data: OwnPiggyTransferRequest) => transferService.ownPiggyTransfer(data),
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['account'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['piggy-accounts'] });
        },
    });
};


