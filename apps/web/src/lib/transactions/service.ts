import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus, TransactionType, TransactionFilters, TransactionUpdate, TransactionStats } from './types';

export class TransactionService {
  private static instance: TransactionService;
  private transactions: Map<string, Transaction> = new Map();
  private storageKey = 'seems_transactions';
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  private constructor() {
    this.loadFromStorage();
    // Save to storage when page unloads
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveToStorage());
    }
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        // Only keep transactions from the last 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const validTransactions = parsed.filter((tx: Transaction) => 
          tx.createdAt > thirtyDaysAgo
        );
        this.transactions = new Map(validTransactions.map((tx: Transaction) => [tx.id, tx]));
      }
    } catch (error) {
      console.error('Failed to load transactions from storage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const transactions = Array.from(this.transactions.values());
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions to storage:', error);
    }
  }

  public createTransaction(
    type: TransactionType,
    quote: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount' | 'maxRetries'>,
    metadata: Omit<Transaction['metadata'], 'timestamp'>,
    status: TransactionStatus = TransactionStatus.PENDING
  ): Transaction {
    const id = uuidv4();
    const now = Date.now();
    
    const transaction: Transaction = {
      ...quote,
      id,
      type,
      status,
      metadata: {
        ...metadata,
        timestamp: now,
      },
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    this.transactions.set(id, transaction);
    this.saveToStorage();
    return transaction;
  }

  public updateTransaction(id: string, update: Omit<TransactionUpdate, 'id'>): Transaction | null {
    const transaction = this.transactions.get(id);
    if (!transaction) return null;

    const now = Date.now();
    const updatedTransaction: Transaction = {
      ...transaction,
      ...(update.status && { status: update.status }),
      ...(update.metadata && {
        metadata: {
          ...transaction.metadata,
          ...update.metadata,
          timestamp: update.metadata.timestamp || transaction.metadata.timestamp,
        },
      }),
      ...(update.error && {
        metadata: {
          ...transaction.metadata,
          error: {
            code: update.error.code,
            message: update.error.message,
            retryable: update.error.retryable ?? false,
          },
        },
        retryCount: transaction.retryCount + 1,
      }),
      updatedAt: now,
    };

    this.transactions.set(id, updatedTransaction);
    this.saveToStorage();
    return updatedTransaction;
  }

  public getTransaction(id: string): Transaction | null {
    return this.transactions.get(id) || null;
  }

  public getTransactions(filters: TransactionFilters = {}): Transaction[] {
    let transactions = Array.from(this.transactions.values());

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      transactions = transactions.filter(tx => statuses.includes(tx.status));
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      transactions = transactions.filter(tx => types.includes(tx.type));
    }

    if (filters.from) {
      transactions = transactions.filter(tx => tx.metadata.fromAddress === filters.from);
    }

    if (filters.to) {
      transactions = transactions.filter(tx => tx.metadata.toAddress === filters.to);
    }

    if (filters.startDate) {
      transactions = transactions.filter(tx => tx.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
      transactions = transactions.filter(tx => tx.createdAt <= filters.endDate!);
    }

    // Default sort by createdAt desc
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    transactions.sort((a, b) => {
      const aValue = sortBy === 'createdAt' ? a.createdAt : a.updatedAt;
      const bValue = sortBy === 'createdAt' ? b.createdAt : b.updatedAt;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Apply pagination if needed
    if (filters.limit) {
      const offset = filters.offset || 0;
      transactions = transactions.slice(offset, offset + filters.limit);
    }

    return transactions;
  }

  public getTransactionStats(): TransactionStats {
    const transactions = Array.from(this.transactions.values());
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const recentTransactions = transactions.filter(tx => tx.createdAt > thirtyDaysAgo);
    const completed = recentTransactions.filter(tx => tx.status === TransactionStatus.COMPLETED);
    const pending = recentTransactions.filter(tx => 
      [TransactionStatus.PENDING, TransactionStatus.PROCESSING].includes(tx.status)
    );
    const failed = recentTransactions.filter(tx => 
      [TransactionStatus.FAILED, TransactionStatus.CANCELLED].includes(tx.status)
    );

    // Calculate total volume per currency
    const totalVolume: Record<string, number> = {};
    completed.forEach(tx => {
      // Safely handle transactions that might not have toAmount/toCurrency
      if ('toAmount' in tx && 'toCurrency' in tx) {
        const amount = parseFloat(tx.toAmount as string);
        const currency = tx.toCurrency as string;
        if (!isNaN(amount) && currency) {
          totalVolume[currency] = (totalVolume[currency] || 0) + amount;
        }
      }
    });

    return {
      total: recentTransactions.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      totalVolume,
      lastUpdated: now,
    };
  }

  public async retryTransaction(
    id: string, 
    updateFn: (tx: Transaction) => Promise<{ success: boolean; error?: string }>
  ): Promise<{ success: boolean; transaction: Transaction | null; error?: string }> {
    const transaction = this.getTransaction(id);
    if (!transaction) {
      return { success: false, transaction: null, error: 'Transaction not found' };
    }

    if (transaction.retryCount >= transaction.maxRetries) {
      this.updateTransaction(id, {
        status: TransactionStatus.FAILED,
        error: {
          code: 'MAX_RETRIES_EXCEEDED',
          message: 'Maximum number of retries reached',
          retryable: false,
        },
      });
      return {
        success: false,
        transaction: this.getTransaction(id),
        error: 'Maximum number of retries reached',
      };
    }

    // Calculate delay based on retry count
    const delay = this.retryDelays[Math.min(transaction.retryCount, this.retryDelays.length - 1)];
    
    try {
      this.updateTransaction(id, {
        status: TransactionStatus.PROCESSING,
        metadata: {
          ...transaction.metadata,
          lastRetry: Date.now(),
        },
      });

      // Wait for the delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      const result = await updateFn(transaction);
      
      if (result.success) {
        this.updateTransaction(id, {
          status: TransactionStatus.COMPLETED,
          metadata: {
            ...transaction.metadata,
            lastUpdated: Date.now(),
          },
        });
        return { success: true, transaction: this.getTransaction(id) };
      } else {
        throw new Error(result.error || 'Unknown error during retry');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateTransaction(id, {
        status: TransactionStatus.FAILED,
        error: {
          code: 'RETRY_FAILED',
          message: `Retry failed: ${errorMessage}`,
          retryable: transaction.retryCount < transaction.maxRetries - 1,
        },
      });

      return {
        success: false,
        transaction: this.getTransaction(id),
        error: errorMessage,
      };
    }
  }

  public clearOldTransactions(daysToKeep: number = 30) {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const [id, tx] of this.transactions.entries()) {
      if (tx.createdAt < cutoff) {
        this.transactions.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.saveToStorage();
    }

    return deletedCount;
  }
}
