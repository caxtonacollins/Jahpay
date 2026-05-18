/**
 * Database layer for transactions
 * Syncs with Supabase when available, falls back to localStorage
 */

import { Transaction, TransactionStatus, TransactionType } from './types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface DbTransaction {
    id: string;
    user_address?: string;
    type: string;
    status: string;
    from_token?: string;
    to_token?: string;
    from_amount: string;
    to_amount: string;
    platform_fee?: string;
    tx_hash?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export class TransactionDb {
    private static readonly TABLE = 'transactions';

    /**
     * Save transaction to database (Supabase + localStorage)
     */
    static async saveTransaction(
        tx: Transaction,
        userAddress?: string
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured) {
                console.log('[TransactionDb] Supabase not configured, skipping remote save');
                return true;
            }

            const dbTx: DbTransaction = {
                id: tx.id,
                user_address: userAddress,
                type: tx.type,
                status: tx.status,
                from_token: tx.metadata.fromAddress,
                to_token: tx.metadata.toAddress,
                from_amount: tx.fromAmount,
                to_amount: tx.toAmount,
                platform_fee: tx.fee,
                tx_hash: tx.metadata.txHash,
                metadata: tx.metadata,
                created_at: new Date(tx.createdAt).toISOString(),
                updated_at: new Date(tx.updatedAt).toISOString(),
            };

            const { error } = await supabase!
                .from(this.TABLE)
                .insert([dbTx]);

            if (error) {
                console.error('[TransactionDb] Failed to save transaction:', error);
                return false;
            }

            console.log('[TransactionDb] Transaction saved:', tx.id);
            return true;
        } catch (error) {
            console.error('[TransactionDb] Error saving transaction:', error);
            return false;
        }
    }

    /**
     * Update transaction status in database
     */
    static async updateTransaction(
        txId: string,
        updates: Partial<DbTransaction>
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured) {
                console.log('[TransactionDb] Supabase not configured, skipping remote update');
                return true;
            }

            const { error } = await supabase!
                .from(this.TABLE)
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', txId);

            if (error) {
                console.error('[TransactionDb] Failed to update transaction:', error);
                return false;
            }

            console.log('[TransactionDb] Transaction updated:', txId);
            return true;
        } catch (error) {
            console.error('[TransactionDb] Error updating transaction:', error);
            return false;
        }
    }

    /**
     * Fetch user's transactions from database
     */
    static async fetchUserTransactions(
        userAddress: string,
        limit: number = 50
    ): Promise<DbTransaction[]> {
        try {
            if (!isSupabaseConfigured) {
                console.log('[TransactionDb] Supabase not configured, skipping remote fetch');
                return [];
            }

            const { data, error } = await supabase!
                .from(this.TABLE)
                .select('*')
                .eq('user_address', userAddress)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[TransactionDb] Failed to fetch transactions:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('[TransactionDb] Error fetching transactions:', error);
            return [];
        }
    }

    /**
     * Get transaction by hash (for confirmation tracking)
     */
    static async getTransactionByHash(txHash: string): Promise<DbTransaction | null> {
        try {
            if (!isSupabaseConfigured) {
                return null;
            }

            const { data, error } = await supabase!
                .from(this.TABLE)
                .select('*')
                .eq('tx_hash', txHash)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows found
                console.error('[TransactionDb] Failed to fetch transaction by hash:', error);
            }

            return data || null;
        } catch (error) {
            console.error('[TransactionDb] Error fetching transaction by hash:', error);
            return null;
        }
    }

    /**
     * Get transaction statistics for user
     */
    static async getUserStats(userAddress: string) {
        try {
            if (!isSupabaseConfigured) {
                return null;
            }

            const { data, error } = await supabase!
                .from(this.TABLE)
                .select('status, to_amount, to_token')
                .eq('user_address', userAddress)
                .eq('status', TransactionStatus.COMPLETED);

            if (error) {
                console.error('[TransactionDb] Failed to fetch user stats:', error);
                return null;
            }

            const stats = {
                totalSwaps: data?.length || 0,
                totalVolume: data?.reduce((sum: number, tx: any) => sum + parseFloat(tx.to_amount || '0'), 0) || 0,
            };

            return stats;
        } catch (error) {
            console.error('[TransactionDb] Error fetching user stats:', error);
            return null;
        }
    }
}
