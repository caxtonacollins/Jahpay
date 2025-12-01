import { ProviderQuote } from '../providers/types';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  SWAP = 'swap',
  SEND = 'send',
  RECEIVE = 'receive',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export interface TransactionMetadata {
  providerName: string;
  providerId?: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  fee?: string;
  feeCurrency?: string;
  timestamp: number;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
  lastRetry?: number;
  lastUpdated?: number;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface Transaction extends ProviderQuote {
  id: string;
  status: TransactionStatus;
  type: TransactionType;
  metadata: TransactionMetadata;
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  maxRetries: number;
}

export interface TransactionFilters {
  status?: TransactionStatus | TransactionStatus[];
  type?: TransactionType | TransactionType[];
  from?: string;
  to?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalVolume: Record<string, number>;
  lastUpdated: number;
}

export interface TransactionUpdate {
  id: string;
  status?: TransactionStatus;
  metadata?: Partial<TransactionMetadata>;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
