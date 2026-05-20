import { NextRequest, NextResponse } from 'next/server';
import { submitSwapFeedbackServer } from '@/lib/agent/erc8004-agent-server';
import type { SwapQuote } from '@/lib/swap/usdc-usdt-swap';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { quote, txHash, success } = await req.json();
    if (!quote || !txHash) {
      return NextResponse.json({ error: 'Missing quote or txHash' }, { status: 400 });
    }

    await submitSwapFeedbackServer(quote as SwapQuote, txHash, success === true);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Agent Feedback]', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
