"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "types/database";

export function useUserProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-profile", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/user/profile", {
        headers: {
          "X-Wallet-Address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json() as Promise<User>;
    },
    enabled: !!walletAddress,
  });
}

export function useKYCStatus(walletAddress?: string) {
  return useQuery({
    queryKey: ["kyc-status", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/user/kyc-status", {
        headers: {
          "X-Wallet-Address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch KYC status");
      return response.json();
    },
    enabled: !!walletAddress,
  });
}

export function useBankAccounts(walletAddress?: string) {
  return useQuery({
    queryKey: ["bank-accounts", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");

      const response = await fetch("/api/user/bank-accounts", {
        headers: {
          "X-Wallet-Address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch bank accounts");
      return response.json();
    },
    enabled: !!walletAddress,
  });
}
