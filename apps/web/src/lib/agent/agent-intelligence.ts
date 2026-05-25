/**
 * Jahpay AI Agent — server-side intelligence layer.
 * Uses live Mento Protocol quotes and tradability checks (no mock data).
 */

import 'server-only';

import {
  getSwapQuote,
  checkPairTradable,
  type SwapTokenSymbol,
} from '@/lib/swap/usdc-usdt-swap';
import { getMentoQuote, isMentoPairTradable } from '@/lib/mento/mento-swap';
import { PLATFORM_FEE_PERCENT, SWAP_CONFIG } from '@/lib/minipay/constants';
import type { AgentRecommendation } from './erc8004-agent';

export type ChatIntent =
  | 'rate'
  | 'quote'
  | 'swap_help'
  | 'slippage'
  | 'status'
  | 'providers'
  | 'greeting'
  | 'unknown';

export interface ChatContext {
  chainId?: number;
  fromToken?: SwapTokenSymbol;
  toToken?: SwapTokenSymbol;
  amount?: string;
}

export interface AgentChatResponse {
  message: string;
  intent: ChatIntent;
  data?: Record<string, unknown>;
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }>;
}

const SWAP_PAIRS: Array<[SwapTokenSymbol, SwapTokenSymbol]> = [
  ['USDC', 'USDT'],
  ['USDT', 'USDC'],
  ['CELO', 'USDC'],
  ['CELO', 'USDT'],
];

export function detectIntent(message: string): ChatIntent {
  const m = message.toLowerCase().trim();

  if (/^(hi|hello|hey|help|what can you)/.test(m)) return 'greeting';
  if (/(rate|price|exchange|how much|1 usdc|1 usdt|peg)/.test(m)) return 'rate';
  if (/(quote|get|receive|output|worth)/.test(m) && /\d/.test(m)) return 'quote';
  if (/(swap|trade|convert|exchange)/.test(m)) return 'swap_help';
  if (/(slippage|tolerance|safe mode|volatile)/.test(m)) return 'slippage';
  if (/(tradable|paused|circuit|available|status|liquidity)/.test(m)) return 'status';
  if (/(uniswap|ubeswap|mento|dex|provider|alternative)/.test(m)) return 'providers';

  if (/\d/.test(m)) return 'quote';
  return 'unknown';
}

function parseAmount(message: string): string | null {
  const match = message.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
}

function parseTokens(message: string): { from: SwapTokenSymbol; to: SwapTokenSymbol } {
  const m = message.toUpperCase();
  const hasUsdc = m.includes('USDC');
  const hasUsdt = m.includes('USDT');
  const hasCelo = m.includes('CELO');

  // CELO pairs
  if (hasCelo && hasUsdc) {
    const celoFirst = m.indexOf('CELO') < m.indexOf('USDC');
    return celoFirst
      ? { from: 'CELO', to: 'USDC' }
      : { from: 'USDC', to: 'CELO' };
  }
  if (hasCelo && hasUsdt) {
    const celoFirst = m.indexOf('CELO') < m.indexOf('USDT');
    return celoFirst
      ? { from: 'CELO', to: 'USDT' }
      : { from: 'USDT', to: 'CELO' };
  }
  if (hasCelo) {
    if (m.includes('TO USDC') || m.includes('FOR USDC')) return { from: 'CELO', to: 'USDC' };
    if (m.includes('TO USDT') || m.includes('FOR USDT')) return { from: 'CELO', to: 'USDT' };
    return { from: 'CELO', to: 'USDC' }; // default CELO target
  }

  // Stablecoin pairs (unchanged)
  if (hasUsdc && hasUsdt) {
    const usdcFirst = m.indexOf('USDC') < m.indexOf('USDT');
    return usdcFirst
      ? { from: 'USDC', to: 'USDT' }
      : { from: 'USDT', to: 'USDC' };
  }
  if (m.includes('TO USDT') || m.includes('FOR USDT')) return { from: 'USDC', to: 'USDT' };
  if (m.includes('TO USDC') || m.includes('FOR USDC')) return { from: 'USDT', to: 'USDC' };
  return { from: 'USDC', to: 'USDT' };
}

export async function computeRecommendation(
  amount: number,
  _fromToken: string,
  chainId = 42220,
): Promise<AgentRecommendation> {
  try {
    // CELO swaps use Uniswap V3 — different volatility profile
    if (_fromToken === 'CELO') {
      // For CELO we can still probe a Uniswap quote via the routing layer
      try {
        const probeAmount = amount > 0 ? String(amount) : '1';
        const quote = await getSwapQuote('CELO', 'USDC', probeAmount, 50, chainId);
        const rate = quote.rate;

        if (amount >= 500) {
          return {
            recommendedSlippageBps: 100,
            marketCondition: 'volatile',
            confidence: 75,
            message: `Large CELO swap via Uniswap V3. Rate: 1 CELO \u2248 $${rate.toFixed(4)}. Higher slippage for price impact.`,
            badge: 'AI: Safe Mode',
            showBadge: true,
          };
        }
        return {
          recommendedSlippageBps: 50,
          marketCondition: 'normal',
          confidence: 85,
          message: `CELO swap via Uniswap V3. Rate: 1 CELO \u2248 $${rate.toFixed(4)}. Standard slippage recommended.`,
          badge: 'AI Optimized',
          showBadge: true,
        };
      } catch {
        return {
          recommendedSlippageBps: 100,
          marketCondition: 'volatile',
          confidence: 65,
          message: 'Could not probe CELO/USDC rate. Using higher slippage for safety.',
          badge: 'AI: Caution',
          showBadge: true,
        };
      }
    }

    // Stablecoin pairs — existing Mento logic (unchanged)
    const [usdcUsdt, usdtUsdc] = await Promise.all([
      checkPairTradable('USDC', 'USDT', chainId),
      checkPairTradable('USDT', 'USDC', chainId),
    ]);

    if (!usdcUsdt || !usdtUsdc) {
      return {
        recommendedSlippageBps: 100,
        marketCondition: 'volatile',
        confidence: 60,
        message:
          'Mento circuit breaker may be active. Use higher slippage or wait before swapping.',
        badge: 'AI: Caution',
        showBadge: true,
      };
    }

    const probeAmount = amount > 0 ? String(amount) : '100';
    const quote = await getSwapQuote('USDC', 'USDT', probeAmount, 50, chainId);
    const deviation = Math.abs(1 - quote.rate);

    if (deviation > 0.005) {
      return {
        recommendedSlippageBps: 100,
        marketCondition: 'volatile',
        confidence: 72,
        message: `Oracle deviation detected (${(deviation * 100).toFixed(3)}%). Wider slippage recommended.`,
        badge: 'AI: Caution',
        showBadge: true,
      };
    }

    if (amount >= 10_000) {
      return {
        recommendedSlippageBps: 100,
        marketCondition: 'normal',
        confidence: 82,
        message: 'Large swap \u2014 live Mento liquidity supports 1% slippage for reliable fills.',
        badge: 'AI: Safe Mode',
        showBadge: true,
      };
    }

    if (amount >= 1_000) {
      return {
        recommendedSlippageBps: 50,
        marketCondition: 'normal',
        confidence: 90,
        message: 'Mid-size swap \u2014 Mento oracle rate is stable. Standard 0.5% slippage.',
        badge: 'AI: Standard',
        showBadge: true,
      };
    }

    return {
      recommendedSlippageBps: 10,
      marketCondition: 'optimal',
      confidence: 96,
      message: `Live rate: 1 USDC \u2248 ${quote.rate.toFixed(6)} USDT. Minimal slippage is safe.`,
      badge: 'AI Optimized',
      showBadge: true,
    };
  } catch {
    return fallbackRecommendation(amount);
  }
}

function fallbackRecommendation(amount: number): AgentRecommendation {
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
    message: 'Stablecoin pair — minimal slippage recommended.',
    badge: 'AI Optimized',
    showBadge: true,
  };
}

export async function processAgentMessage(
  userMessage: string,
  context: ChatContext = {},
): Promise<AgentChatResponse> {
  const intent = detectIntent(userMessage);
  const chainId = context.chainId ?? 42220;
  const tokens = context.fromToken && context.toToken
    ? { from: context.fromToken, to: context.toToken }
    : parseTokens(userMessage);
  const amount = context.amount ?? parseAmount(userMessage) ?? '100';

  switch (intent) {
    case 'greeting':
      return {
        intent,
        message:
          "I'm the Jahpay Swap Agent on Celo. I can fetch live rates, quote swaps, recommend slippage, and guide you through USDC\u2194USDT and CELO\u2194USDC/USDT swaps. Try: \"What's the rate for 500 USDC?\" or \"Swap 10 CELO to USDC\".",
        suggestedActions: [
          { label: 'Get rate', action: 'rate', payload: { amount: '100', fromToken: 'USDC', toToken: 'USDT' } },
          { label: 'Quote 10 CELO', action: 'quote', payload: { amount: '10', fromToken: 'CELO', toToken: 'USDC' } },
        ],
      };

    case 'rate':
    case 'quote': {
      try {
        const quote = await getSwapQuote(tokens.from, tokens.to, amount, 50, chainId);
        const rec = await computeRecommendation(parseFloat(amount), tokens.from, chainId);
        return {
          intent,
          message: [
            `**Live Mento quote** (${chainId === 11142220 ? 'Celo Sepolia' : 'Celo Mainnet'}):`,
            `• ${amount} ${tokens.from} → **${quote.amountOutNet}** ${tokens.to} (after ${PLATFORM_FEE_PERCENT}% platform fee)`,
            `• Rate: 1 ${tokens.from} = ${quote.rate.toFixed(6)} ${tokens.to}`,
            `• Route: ${quote.route === 'uniswap-v3' ? 'Uniswap V3' : quote.route === 'direct' ? 'Direct (Mento)' : `${tokens.from} \u2192 USDm \u2192 ${tokens.to}`}`,
            `• Recommended slippage: ${rec.recommendedSlippageBps / 100}%`,
            quote.isTradable
              ? '• Pair is tradable ✓'
              : '• ⚠️ Circuit breaker may be active — swap with caution',
          ].join('\n'),
          data: { quote, recommendation: rec },
          suggestedActions: [
            {
              label: `Swap ${amount} ${tokens.from}`,
              action: 'prepare_swap',
              payload: { amount, fromToken: tokens.from, toToken: tokens.to, slippageBps: rec.recommendedSlippageBps },
            },
          ],
        };
      } catch (err) {
        return {
          intent,
          message: `Could not fetch live quote: ${err instanceof Error ? err.message : 'Unknown error'}. Check your amount and network.`,
        };
      }
    }

    case 'swap_help': {
      const rec = await computeRecommendation(parseFloat(amount) || 100, tokens.from, chainId);
      return {
        intent,
        message: [
          `To swap ${amount} ${tokens.from} → ${tokens.to}:`,
          '1. Connect your wallet on Celo',
          '2. Enter the amount in the swap panel',
          '3. Review the live quote and AI slippage suggestion',
          '4. Confirm the swap — Mento executes on-chain',
          '',
          `AI recommends **${rec.recommendedSlippageBps / 100}%** slippage: ${rec.message}`,
        ].join('\n'),
        data: { recommendation: rec },
        suggestedActions: [
          {
            label: 'Prepare swap in UI',
            action: 'prepare_swap',
            payload: { amount, fromToken: tokens.from, toToken: tokens.to, slippageBps: rec.recommendedSlippageBps },
          },
        ],
      };
    }

    case 'slippage': {
      const rec = await computeRecommendation(parseFloat(amount) || 100, tokens.from, chainId);
      return {
        intent,
        message: `Recommended slippage: **${rec.recommendedSlippageBps / 100}%** (${rec.marketCondition} conditions, ${rec.confidence}% confidence). ${rec.message} Options: ${SWAP_CONFIG.SLIPPAGE_OPTIONS.map((b) => `${b / 100}%`).join(', ')}.`,
        data: { recommendation: rec },
      };
    }

    case 'status': {
      const tradable = await checkPairTradable(tokens.from, tokens.to, chainId);
      let celoTradable = false;
      try {
        celoTradable = await isMentoPairTradable('CELO', 'USDC', chainId);
      } catch {
        celoTradable = false;
      }
      return {
        intent,
        message: [
          `**Market status** (${chainId === 11142220 ? 'Sepolia' : 'Mainnet'}):`,
          `• USDC↔USDT: ${tradable ? '✅ Tradable on Mento' : '⛔ Paused / circuit breaker'}`,
          `• CELO↔USDC (Mento): ${celoTradable ? '✅ Available' : '❌ Not directly tradable or unavailable'}`,
          'For CELO swaps, use Ubeswap or Uniswap on Celo (see providers).',
        ].join('\n'),
        data: { usdcUsdtTradable: tradable, celoUsdcTradable: celoTradable },
      };
    }

    case 'providers':
      return {
        intent,
        message: [
          '**Swap providers on Celo:**',
          '• **Mento** (primary) — Oracle-priced stablecoin swaps USDC↔USDT. Jahpay uses this natively.',
          '• **Ubeswap** — Celo-native DEX; good for CELO and token pairs.',
          '• **Uniswap** — Deployed on Celo; broad liquidity.',
          '• **Velodrome** — Listed on Celo docs for additional liquidity.',
          '',
          'Jahpay compares rates via Mento live quotes. Cross-DEX routing can be added via aggregator APIs.',
        ].join('\n'),
        suggestedActions: [
          { label: 'Compare live rates', action: 'rate', payload: { amount: '100', fromToken: 'USDC', toToken: 'USDT' } },
        ],
      };

    default:
      return {
        intent: 'unknown',
        message:
          "I didn't quite catch that. Ask me about rates, quotes, slippage, swap steps, or DEX providers on Celo.",
        suggestedActions: [
          { label: 'What is the USDC/USDT rate?', action: 'rate', payload: {} },
        ],
      };
  }
}

/** Fetch all stable pair rates for dashboard / premium analysis */
export async function getMarketSnapshot(chainId = 42220) {
  const amount = '1000';
  const results = await Promise.allSettled(
    SWAP_PAIRS.map(async ([from, to]) => {
      const quote = await getSwapQuote(from, to, amount, 50, chainId);
      const tradable = await checkPairTradable(from, to, chainId);
      return { from, to, quote, tradable };
    }),
  );

  const pairs = results
    .filter((r): r is PromiseFulfilledResult<{ from: SwapTokenSymbol; to: SwapTokenSymbol; quote: Awaited<ReturnType<typeof getSwapQuote>>; tradable: boolean }> => r.status === 'fulfilled')
    .map((r) => r.value);

  let celoRate: { rate: number } | null = null;
  try {
    const celoQuote = await getMentoQuote('CELO', 'USDC', '1', chainId);
    celoRate = { rate: celoQuote.rate };
  } catch {
    celoRate = null;
  }

  const avgDeviation =
    pairs.length > 0
      ? pairs.reduce((sum, p) => sum + Math.abs(1 - p.quote.rate), 0) / pairs.length
      : 0;

  return {
    pairs,
    celoRate,
    avgDeviation,
    volatilityIndex: avgDeviation > 0.003 ? 'elevated' : 'low',
    timestamp: new Date().toISOString(),
  };
}
