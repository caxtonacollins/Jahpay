import { NextRequest, NextResponse } from 'next/server';
import { processAgentMessage } from '@/lib/agent/agent-intelligence';
import type { SwapTokenSymbol } from '@/lib/swap/usdc-usdt-swap';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, chainId, fromToken, toToken, amount } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await processAgentMessage(message, {
      chainId: typeof chainId === 'number' ? chainId : undefined,
      fromToken: fromToken as SwapTokenSymbol | undefined,
      toToken: toToken as SwapTokenSymbol | undefined,
      amount: typeof amount === 'string' ? amount : undefined,
    });

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Agent Chat]', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 },
    );
  }
}
