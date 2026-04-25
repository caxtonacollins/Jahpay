import { NextRequest, NextResponse } from 'next/server';
import { getMentoQuote, isMentoPairTradable } from '@/lib/mento/mento-swap';

/**
 * GET /api/providers/mento-quotes
 * Get a Mento swap quote
 * 
 * Query params:
 * - from: Token symbol (e.g., 'USDm', 'CELO', 'USDC')
 * - to: Token symbol
 * - amount: Amount in human-readable format
 * - chainId: Chain ID (optional, defaults to 42220)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');
    const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 42220;

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to, amount' },
        { status: 400 }
      );
    }

    // Validate amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check if pair is tradable
    const isTradable = await isMentoPairTradable(from, to, chainId);
    if (!isTradable) {
      return NextResponse.json(
        { error: `${from}/${to} pair is not currently tradable on Mento` },
        { status: 400 }
      );
    }

    // Get quote
    const quote = await getMentoQuote(from, to, amount, chainId);

    return NextResponse.json({
      provider: 'mento',
      quote,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mento quote error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get Mento quote',
      },
      { status: 500 }
    );
  }
}
