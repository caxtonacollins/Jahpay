'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProviderFactory } from '@/lib/providers/factory';
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from '@/lib/providers/types';

type ProvidersContextType = {
  providers: string[];
  selectedProvider: string | null;
  setSelectedProvider: (provider: string | null) => void;
  getQuote: (request: ProviderQuoteRequest) => Promise<{
    bestQuote: ProviderQuote;
    allQuotes: ProviderQuote[];
  }>;
  getExchangeRates: (from: string, to: string) => Promise<ExchangeRate[]>;
  isLoading: boolean;
  error: Error | null;
};

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined);

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  // Initialize providers on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await ProviderFactory.getInstance().initialize();
        const availableProviders = ProviderFactory.getInstance().getAllProviders();
        setProviders(availableProviders);
        
        // Set the first provider as default if none is selected
        if (availableProviders.length > 0 && !selectedProvider) {
          setSelectedProvider(availableProviders[0]);
        }
      } catch (err) {
        console.error('Failed to initialize providers:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize providers'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [selectedProvider]);

  const getQuote = async (request: ProviderQuoteRequest) => {
    try {
      setIsLoading(true);
      return await ProviderFactory.getInstance().getBestQuote(request);
    } catch (err) {
      console.error('Error getting quote:', err);
      throw err instanceof Error ? err : new Error('Failed to get quote');
    } finally {
      setIsLoading(false);
    }
  };

  const getExchangeRates = async (from: string, to: string) => {
    try {
      setIsLoading(true);
      return await ProviderFactory.getInstance().getExchangeRates(from, to);
    } catch (err) {
      console.error('Error getting exchange rates:', err);
      throw err instanceof Error ? err : new Error('Failed to get exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        selectedProvider,
        setSelectedProvider,
        getQuote,
        getExchangeRates,
        isLoading,
        error,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
}

export function useProviders() {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    throw new Error('useProviders must be used within a ProvidersProvider');
  }
  return context;
}

// Custom hook for getting the best quote
// This hook will automatically refetch when the input changes
export function useQuote(request: ProviderQuoteRequest | null) {
  const { getQuote, isLoading } = useProviders();
  const [quote, setQuote] = useState<{
    bestQuote: ProviderQuote;
    allQuotes: ProviderQuote[];
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!request?.from || !request?.to || !request?.amount) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      try {
        setIsFetching(true);
        const result = await getQuote(request);
        setQuote(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch quote'));
        setQuote(null);
      } finally {
        setIsFetching(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [request, getQuote]);

  return {
    quote,
    isLoading: isLoading || isFetching,
    error,
  };
}

// Custom hook for getting exchange rates
export function useExchangeRates(from: string, to: string) {
  const { getExchangeRates, isLoading } = useProviders();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!from || !to) {
      setRates([]);
      return;
    }

    const fetchRates = async () => {
      try {
        setIsFetching(true);
        const result = await getExchangeRates(from, to);
        setRates(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch exchange rates'));
        setRates([]);
      } finally {
        setIsFetching(false);
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchRates();
    const intervalId = setInterval(fetchRates, 30000);
    
    return () => clearInterval(intervalId);
  }, [from, to, getExchangeRates]);

  return {
    rates,
    isLoading: isLoading || isFetching,
    error,
  };
}
