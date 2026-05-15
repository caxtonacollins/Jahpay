/**
 * USDC ↔ USDT Swap library powered by Mento Protocol SDK v3
 * Handles quotes, transaction building, and fee deduction.
 */

import { Mento, ChainId, deadlineFromMinutes } from '@mento-protocol/mento-sdk';
import { parseUnits, formatUnits } from 'viem';
import { SWAP_TOKENS, SUPPORTED_TOKENS, PLATFORM_FEE_BPS, SWAP_CONFIG } from '../minipay/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SwapTokenSymbol = 'USDC' | 'USDT';

export interface SwapQuote {
  fromToken: SwapTokenSymbol;
  toToken: SwapTokenSymbol;
  amountIn: string;
  /** Gross amount before fee */
  amountOutGross: string;
  /** Net amount user receives after platform fee */
  amountOutNet: string;
  /** Platform fee in output token */
  platformFee: string;
  platformFeePercent: number;
  /** Exchange rate (net) */
  rate: number;
  /** Is this a direct swap or routed via USDm? */
  route: 'direct' | 'via-usdm';
  /** Slippage tolerance in BPS used for this quote */
  slippageBps: number;
  /** Is the pair currently tradable? */
  isTradable: boolean;
  timestamp: number;
}

export interface SwapTransaction {
  approval: any | null;
  swap: any;
  quote: SwapQuote;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTokenAddress(symbol: string, chainId: number): string {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`Token ${symbol} not found`);
  return chainId === 11142220 ? (token as any).addressSepolia || token.address : token.address;
}

function getTokenDecimals(symbol: string): number {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`Token ${symbol} not found`);
  return token.decimals;
}

async function getMento(chainId: number): Promise<Mento> {
  const mentoChainId = chainId === 11142220 ? ChainId.CELO_SEPOLIA : ChainId.CELO;
  return Mento.create(mentoChainId);
}

/** Compute platform fee and net amount */
function applyFee(grossAmountStr: string, decimals: number): {
  gross: string;
  fee: string;
  net: string;
} {
  const grossBig = BigInt(Math.round(parseFloat(grossAmountStr) * 10 ** decimals));
  const feeBig = (grossBig * BigInt(PLATFORM_FEE_BPS)) / BigInt(10_000);
  const netBig = grossBig - feeBig;
  return {
    gross: formatUnits(grossBig, decimals),
    fee: formatUnits(feeBig, decimals),
    net: formatUnits(netBig, decimals),
  };
}

// ─── Check pair tradability ───────────────────────────────────────────────────

export async function checkPairTradable(
  fromToken: SwapTokenSymbol,
  toToken: SwapTokenSymbol,
  chainId = 42220
): Promise<boolean> {
  try {
    const mento = await getMento(chainId);
    const fromAddr = getTokenAddress(fromToken, chainId);
    const toAddr = getTokenAddress(toToken, chainId);
    return await mento.trading.isPairTradable(fromAddr, toAddr);
  } catch {
    // Fallback: assume tradable if SDK call fails (circuit breaker check)
    return true;
  }
}

// ─── Get Swap Quote ───────────────────────────────────────────────────────────

export async function getSwapQuote(
  fromToken: SwapTokenSymbol,
  toToken: SwapTokenSymbol,
  amountIn: string,
  slippageBps: number = SWAP_CONFIG.DEFAULT_SLIPPAGE_BPS,
  chainId = 42220
): Promise<SwapQuote> {
  if (!amountIn || parseFloat(amountIn) <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const mento = await getMento(chainId);
  const fromAddr = getTokenAddress(fromToken, chainId);
  const toAddr = getTokenAddress(toToken, chainId);
  const fromDecimals = getTokenDecimals(fromToken);
  const toDecimals = getTokenDecimals(toToken);

  const amountInParsed = parseUnits(amountIn, fromDecimals);

  // Check tradability (circuit breaker)
  let isTradable = true;
  try {
    isTradable = await mento.trading.isPairTradable(fromAddr, toAddr);
  } catch {
    isTradable = true;
  }

  // Try direct quote first, fall back to routing via USDm
  let amountOutRaw: bigint;
  let route: 'direct' | 'via-usdm' = 'direct';

  try {
    amountOutRaw = await mento.quotes.getAmountOut(fromAddr, toAddr, amountInParsed);
  } catch {
    // Route via USDm
    const usdmToken = SUPPORTED_TOKENS.find((t) => t.symbol === 'USDm')!;
    const usdmAddr = chainId === 11142220 ? usdmToken.addressSepolia : usdmToken.address;
    const midAmount = await mento.quotes.getAmountOut(fromAddr, usdmAddr, amountInParsed);
    amountOutRaw = await mento.quotes.getAmountOut(usdmAddr, toAddr, midAmount);
    route = 'via-usdm';
  }

  const grossStr = formatUnits(amountOutRaw, toDecimals);
  const { gross, fee, net } = applyFee(grossStr, toDecimals);
  const rate = parseFloat(net) / parseFloat(amountIn);

  return {
    fromToken,
    toToken,
    amountIn,
    amountOutGross: gross,
    amountOutNet: net,
    platformFee: fee,
    platformFeePercent: PLATFORM_FEE_BPS / 100,
    rate,
    route,
    slippageBps,
    isTradable,
    timestamp: Date.now(),
  };
}

// ─── Build Swap Transaction ───────────────────────────────────────────────────

export async function buildSwapTransaction(
  fromToken: SwapTokenSymbol,
  toToken: SwapTokenSymbol,
  amountIn: string,
  userAddress: string,
  slippageBps: number = SWAP_CONFIG.DEFAULT_SLIPPAGE_BPS,
  chainId = 42220
): Promise<SwapTransaction> {
  const quote = await getSwapQuote(fromToken, toToken, amountIn, slippageBps, chainId);

  if (!quote.isTradable) {
    throw new Error(`${fromToken}↔${toToken} is temporarily paused by Mento circuit breaker`);
  }

  const mento = await getMento(chainId);
  const fromAddr = getTokenAddress(fromToken, chainId);
  const toAddr = getTokenAddress(toToken, chainId);
  const fromDecimals = getTokenDecimals(fromToken);
  const amountInParsed = parseUnits(amountIn, fromDecimals);
  const slippageTolerance = slippageBps / 100; // SDK takes percentage

  const { approval, swap } = await mento.swap.buildSwapTransaction(
    fromAddr,
    toAddr,
    amountInParsed,
    userAddress,
    userAddress,
    {
      slippageTolerance,
      deadline: deadlineFromMinutes(SWAP_CONFIG.DEADLINE_MINUTES),
    }
  );

  return {
    approval: approval || null,
    swap,
    quote,
  };
}

// ─── Token utilities ──────────────────────────────────────────────────────────

export function getSwapTokenInfo(symbol: SwapTokenSymbol) {
  return SWAP_TOKENS.find((t) => t.symbol === symbol)!;
}

export function getOppositeToken(symbol: SwapTokenSymbol): SwapTokenSymbol {
  return symbol === 'USDC' ? 'USDT' : 'USDC';
}

export function formatTokenAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}
