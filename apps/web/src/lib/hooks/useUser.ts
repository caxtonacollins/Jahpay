"use client";

import { useQuery } from "@tanstack/react-query";

export function useUser(walletAddress?: string) {
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
      return response.json() as Promise<any>;
    },
    enabled: !!walletAddress,
  });
}
