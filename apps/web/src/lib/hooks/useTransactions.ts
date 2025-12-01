"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "types/database";

export function useTransactions(walletAddress?: string) {
  return useQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/ramp/transactions", {
        headers: {
          "X-Wallet-Address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!walletAddress,
  });
}

export function useTransaction(transactionId: string, walletAddress?: string) {
  return useQuery({
    queryKey: ["transaction", transactionId, walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch(`/api/ramp/transaction/${transactionId}`, {
        headers: {
          "X-Wallet-Address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch transaction");
      return response.json();
    },
    enabled: !!walletAddress && !!transactionId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useInitiateOnRamp(walletAddress?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/ramp/on-ramp/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": walletAddress,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Failed to initiate on-ramp");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useInitiateOffRamp(walletAddress?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/ramp/off-ramp/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": walletAddress,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Failed to initiate off-ramp");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
