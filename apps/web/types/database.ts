// Types for user management
export interface User {
  id: string;
  wallet_address: string;
  country_code?: string;
  preferred_provider?: string;
  kyc_status: "pending" | "verified" | "rejected";
  created_at: Date;
  updated_at: Date;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  country_code: string;
  is_verified: boolean;
  is_default: boolean;
  created_at: Date;
}

export interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  uses: number;
  rewards_earned: number;
  created_at: Date;
  updated_at: Date;
}

// Types for transactions
export type TransactionType = "on-ramp" | "off-ramp";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  provider: string;
  status: TransactionStatus;

  // Crypto details
  crypto_amount: number;
  crypto_currency: string;
  wallet_address: string;
  blockchain_tx_hash?: string;

  // Fiat details
  fiat_amount: number;
  fiat_currency: string;
  bank_account_number?: string;
  bank_code?: string;
  recipient_name?: string;

  // Provider details
  provider_tx_id?: string;
  provider_reference?: string;
  provider_fee?: number;

  // Rates & fees
  exchange_rate: number;
  platform_fee: number;

  // Metadata
  metadata?: Record<string, any>;
  error_message?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Types for exchange rates
export interface ExchangeRate {
  id: string;
  provider: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  expires_at: Date;
  created_at: Date;
}

export interface ProviderStatus {
  provider: string;
  is_active: boolean;
  success_rate?: number;
  avg_completion_time?: number;
  last_checked_at?: Date;
  updated_at: Date;
}

// API Request/Response types
export interface InitiateOnRampRequest {
  amount: number;
  crypto_currency: string;
  fiat_currency: string;
  fiat_amount: number;
  country_code: string;
  preferred_provider?: string;
}

export interface InitiateOnRampResponse {
  transaction_id: string;
  provider: string;
  status: TransactionStatus;
  provider_url?: string;
  expires_in?: number;
}

export interface InitiateOffRampRequest {
  amount: number;
  crypto_currency: string;
  fiat_currency: string;
  bank_account_id: string;
  country_code: string;
  preferred_provider?: string;
}

export interface InitiateOffRampResponse {
  transaction_id: string;
  provider: string;
  status: TransactionStatus;
  provider_url?: string;
  expires_in?: number;
}

export interface QuoteRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
  type: "buy" | "sell";
  country?: string;
}

export interface QuoteResponse {
  provider: string;
  rate: number;
  fiat_amount?: number;
  crypto_amount?: number;
  fee: number;
  total: number;
  expires_in: number;
}

// Provider types
export interface ProviderConfig {
  name: string;
  is_active: boolean;
  countries: string[];
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
  completion_time: number; // in minutes
}

export interface BankDetails {
  code: string;
  name: string;
  country: string;
  logo?: string;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  transaction_id: string;
  provider_tx_id: string;
  status: TransactionStatus;
  timestamp: number;
  metadata?: Record<string, any>;
}
