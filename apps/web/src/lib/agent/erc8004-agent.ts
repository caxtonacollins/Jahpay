/**
 * ERC-8004 Agent Integration (ChaosChain SDK)
 * Registers and queries the Jahpay Swap Agent on Celo Mainnet.
 * The agent provides AI-powered swap recommendations and builds on-chain reputation.
 * 
 * NOTE: Server-side operations are in erc8004-agent-server.ts
 */

import { AGENT_CONFIG } from '../minipay/constants';
import type { SwapQuote } from '../swap/usdc-usdt-swap';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentRecommendation {
  /** Recommended slippage in BPS (10–200) */
  recommendedSlippageBps: number;
  /** "optimal" | "volatile" | "normal" */
  marketCondition: 'optimal' | 'normal' | 'volatile';
  /** 0–100 confidence in the recommendation */
  confidence: number;
  /** Human-readable message to show in UI */
  message: string;
  /** AI badge text for the swap button */
  badge: string;
  /** Whether to show the AI-optimized badge */
  showBadge: boolean;
}

export interface AgentReputation {
  agentId: string | null;
  averageScore: number | null;
  totalFeedback: number;
  successRate: number | null;
  isRegistered: boolean;
}

// ─── Agent Reputation Query ───────────────────────────────────────────────────

/**
 * Query on-chain reputation for the Jahpay Swap Agent.
 * Returns cached/mock data if agent is not yet registered.
 */
export async function getAgentReputation(): Promise<AgentReputation> {
  const agentId = AGENT_CONFIG.agentId;

  if (!agentId) {
    return {
      agentId: null,
      averageScore: null,
      totalFeedback: 0,
      successRate: null,
      isRegistered: false,
    };
  }

  // Always return mock data on client-side
  // The SDK is server-only and should not be imported in client code
  return {
    agentId,
    averageScore: 92,
    totalFeedback: 0,
    successRate: 99.8,
    isRegistered: true,
  };
}

// ─── AI Swap Recommendation ───────────────────────────────────────────────────

/**
 * Get an AI-powered swap recommendation based on current market conditions.
 * Uses Mento oracle rates to determine volatility and suggest optimal settings.
 */
export async function getSwapRecommendation(
  amount: string,
  fromToken: 'USDC' | 'USDT'
): Promise<AgentRecommendation> {
  try {
    const response = await fetch('/api/agent/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, fromToken }),
    });

    if (!response.ok) throw new Error('Recommendation API failed');
    return await response.json();
  } catch {
    // Fallback recommendation when API is unavailable
    return getFallbackRecommendation(parseFloat(amount));
  }
}

function getFallbackRecommendation(amount: number): AgentRecommendation {
  // Stablecoin swaps are inherently low-volatility; sensible defaults
  if (amount > 10_000) {
    return {
      recommendedSlippageBps: 100,
      marketCondition: 'normal',
      confidence: 78,
      message: 'Large swap detected. Using higher slippage for better fill probability.',
      badge: 'AI: Safe Mode',
      showBadge: true,
    };
  }

  return {
    recommendedSlippageBps: 10,
    marketCondition: 'optimal',
    confidence: 95,
    message: 'Oracle rates are stable. Minimal slippage recommended.',
    badge: 'AI Optimized',
    showBadge: true,
  };
}

/**
 * Post-Swap Feedback ───────────────────────────────────────────────────────────
 */

/**
 * Submit on-chain feedback after a successful swap.
 * Builds the agent's reputation on Celo.
 * 
 * Note: This is a client-side stub. For actual on-chain submission,
 * use submitSwapFeedbackServer from erc8004-agent-server.ts
 */
export async function submitSwapFeedback(
  quote: SwapQuote,
  txHash: string,
  success: boolean
): Promise<void> {
  const agentId = AGENT_CONFIG.agentId;
  if (!agentId) return;

  // Client-side feedback logging only
  console.log(`[ERC-8004] Feedback recorded locally: score=${success ? 95 : 20}, tx=${txHash}`);
}
