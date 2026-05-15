"use client";

import { useQuery } from "@tanstack/react-query";
// providers module removed — types inlined below
type ProviderExchangeRate = { from: string; to: string; rate: number };
type ProviderQuote = { fromToken: string; toToken: string; fromAmount: string; toAmount: string; provider?: string };

type RatesResponse = {
  from: string;
  to: string;
  amount: string;
  bestQuote: ProviderQuote;
  allQuotes: ProviderQuote[];
  rates: ProviderExchangeRate[];
  timestamp: string;
};

export function useExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  amount: number
) {
  return useQuery({
    queryKey: ["exchange-rate", fromCurrency, toCurrency, amount],
    queryFn: async () => {
      const response = await fetch(
        `/api/providers/rates?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      if (!response.ok) throw new Error("Failed to fetch rates");
      return response.json() as Promise<RatesResponse>;
    },
    enabled: !!fromCurrency && !!toCurrency && amount > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await fetch("/api/providers");

      if (!response.ok) throw new Error("Failed to fetch providers");
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
}
