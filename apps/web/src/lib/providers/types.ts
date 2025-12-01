export interface ProviderQuote {
  provider: string;
  fromAmount: string;
  toAmount: string;
  rate: number;
  minAmount: string;
  maxAmount: string;
  fee: string;
  estimatedTime: string;
  providerFee?: string;
  networkFee?: string;
  totalToReceive?: string;
}

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  isActive: boolean;
  supportedPairs: {
    from: string[];
    to: string[];
  };
  feePercentage: number;
  logo: string;
  description: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  provider: string;
}

export interface ProviderQuoteRequest {
  from: string;
  to: string;
  amount: string;
  address?: string;
  network?: string;
}
