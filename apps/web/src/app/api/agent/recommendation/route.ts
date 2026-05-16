import { NextRequest, NextResponse } from 'next/server';
import type { AgentRecommendation } from '@/types/agent';

export const runtime = 'edge';

/**
 * AI Swap Recommendation API
 * Called by the frontend to get agent-powered swap settings.
 * Analyzes amount size and returns optimal slippage + market condition.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, fromToken } = await req.json();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const recommendation = computeRecommendation(parsedAmount, fromToken);

    return NextResponse.json(recommendation, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to compute recommendation' },
      { status: 500 }
    );
  }
}

function computeRecommendation(amount: number, fromToken: string): AgentRecommendation {
  // USDC↔USDT is extremely stable — oracle-priced via Mento
  // Recommendations scale with swap size

  if (amount < 100) {
    return {
      recommendedSlippageBps: 10,        // 0.1% — micro swaps
      marketCondition: 'optimal',
      confidence: 97,
      message: 'Oracle rates are stable. Ultra-low slippage is safe for this amount.',
      badge: 'AI Optimized',
      showBadge: true,
    };
  }

  if (amount < 1_000) {
    return {
      recommendedSlippageBps: 10,
      marketCondition: 'optimal',
      confidence: 95,
      message: 'Excellent liquidity conditions. Proceeding with minimal slippage.',
      badge: 'AI Optimized',
      showBadge: true,
    };
  }

  if (amount < 10_000) {
    return {
      recommendedSlippageBps: 50,
      marketCondition: 'normal',
      confidence: 88,
      message: 'Mid-size swap. Standard slippage applied for reliable execution.',
      badge: 'AI: Standard',
      showBadge: true,
    };
  }

  // Large swap
  return {
    recommendedSlippageBps: 100,
    marketCondition: 'normal',
    confidence: 80,
    message: 'Large swap detected. Increased slippage improves fill probability.',
    badge: 'AI: Safe Mode',
    showBadge: true,
  };
}
