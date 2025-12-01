import { CURRENCIES, CRYPTOS } from '@/config/site';

export type Currency = keyof typeof CURRENCIES;
export type Crypto = keyof typeof CRYPTOS;

export type SwapDirection = 'buy' | 'sell';

export interface TokenAmount {
  value: string;
  currency: string;
  crypto: string;
}

export interface SwapFormData {
  from: TokenAmount;
  to: TokenAmount;
  direction: SwapDirection;
  rate: number;
  provider: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  icon?: string;
  balance?: string;
  usdValue?: number;
}

export interface RateResponse {
  rate: number;
  minAmount: number;
  maxAmount: number;
  estimatedTime: string;
  provider: string;
}
