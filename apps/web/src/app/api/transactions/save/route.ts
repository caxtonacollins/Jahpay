import { NextRequest, NextResponse } from 'next/server';
import { TransactionDb } from '@/lib/transactions/db';

export const runtime = 'nodejs';

/**
 * Save a swap transaction to the database
 * Called after a successful swap on the frontend
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            userAddress,
            type,
            fromToken,
            toToken,
            amountIn,
            amountOut,
            platformFee,
            txHash,
            status,
        } = body;

        // Validate required fields
        if (!userAddress || !type || !amountIn || !amountOut || !txHash) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save to database
        const success = await TransactionDb.saveTransaction(
            {
                id: txHash, // Use tx hash as ID for uniqueness
                type,
                status,
                fromAmount: amountIn,
                toAmount: amountOut,
                fee: platformFee,
                provider: 'Mento',
                rate: parseFloat(amountOut) / parseFloat(amountIn),
                metadata: {
                    providerName: 'Mento Protocol',
                    fromAddress: fromToken,
                    toAddress: toToken,
                    txHash,
                    timestamp: Date.now(),
                    feeCurrency: toToken,
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
                retryCount: 0,
                maxRetries: 3,
            },
            userAddress
        );

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to save transaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Transaction saved successfully',
            txHash,
        });
    } catch (error) {
        console.error('[API] Error saving transaction:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
