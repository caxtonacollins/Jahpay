import { NextRequest, NextResponse } from 'next/server';
import { getMarketSnapshot } from '@/lib/agent/agent-intelligence';

export const runtime = 'nodejs';

/**
 * Live market rates from Mento Protocol.
 * Complements Mento swaps with transparency for USDC/USDT/CELO pairs.
 */
export async function GET(req: NextRequest) {
  try {
    const chainId = parseInt(
      req.nextUrl.searchParams.get('chainId') ||
        process.env.NEXT_PUBLIC_CHAIN_ID ||
        '42220',
      10,
    );

    const snapshot = await getMarketSnapshot(chainId);

    return NextResponse.json({
      chainId,
      provider: 'Mento Protocol v3',
      alternativeProviders: [
        { name: 'Ubeswap', url: 'https://app.ubeswap.org', type: 'DEX' },
        { name: 'Uniswap', url: 'https://app.uniswap.org', type: 'DEX' },
        { name: 'Velodrome', url: 'https://velodrome.finance', type: 'DEX' },
      ],
      ...snapshot,
    });
  } catch (error) {
    console.error('[Swap Rates]', error);
    return NextResponse.json(
      { error: 'Failed to fetch market rates' },
      { status: 500 },
    );
  }
}
