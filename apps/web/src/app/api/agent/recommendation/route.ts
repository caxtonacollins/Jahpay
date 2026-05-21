import { NextRequest, NextResponse } from 'next/server';
import { computeRecommendation } from '@/lib/agent/agent-intelligence';
import { withRateLimit } from '@/lib/api/middleware';

export const runtime = 'nodejs';

/**
 * AI Swap Recommendation API — uses live Mento quotes and tradability.
 */
async function handler(req: NextRequest) {
  try {
    const { amount, fromToken, chainId } = await req.json();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const recommendation = await computeRecommendation(
      parsedAmount,
      fromToken ?? 'USDC',
      typeof chainId === 'number' ? chainId : 42220,
    );

    return NextResponse.json(recommendation, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to compute recommendation' },
      { status: 500 },
    );
  }
}

// Apply rate limiting: 30 requests per minute
export const POST = withRateLimit(handler, { limit: 30, window: 60000 });
