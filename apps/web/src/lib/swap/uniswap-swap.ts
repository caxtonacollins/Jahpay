/**
 * Uniswap V3 Swap engine for CELO ↔ USDC/USDT pairs on Celo mainnet.
 * Uses SwapRouter02 (exactInputSingle) and QuoterV2 for on-chain quotes.
 *
 * This module is ONLY used for swaps involving CELO.
 * Stablecoin-only swaps (USDC↔USDT) continue to use Mento via usdc-usdt-swap.ts.
 */

import {
  createPublicClient,
  http,
  encodeFunctionData,
  formatUnits,
  parseUnits,
  type Address,
} from 'viem';
import { celo } from 'viem/chains';
import {
  SWAP_TOKENS,
  SUPPORTED_TOKENS,
  PLATFORM_FEE_BPS,
  UNISWAP_V3_CONTRACTS,
  UNISWAP_POOL_FEE,
  SWAP_CONFIG,
} from '../minipay/constants';
import type { SwapQuote, SwapTransaction, SwapTokenSymbol } from './usdc-usdt-swap';

// ─── ABIs (minimal) ──────────────────────────────────────────────────────────

const QUOTER_V2_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPublicClient() {
  return createPublicClient({
    chain: celo,
    transport: http(),
  });
}

function getTokenAddress(symbol: string): Address {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  if (!token) {
    const swapToken = SWAP_TOKENS.find((t) => t.symbol === symbol);
    if (!swapToken) throw new Error(`Token ${symbol} not found`);
    return swapToken.address as Address;
  }
  return token.address as Address;
}

function getTokenDecimals(symbol: string): number {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  if (token) return token.decimals;
  const swapToken = SWAP_TOKENS.find((t) => t.symbol === symbol);
  if (swapToken) return swapToken.decimals;
  throw new Error(`Token ${symbol} not found`);
}

/** Apply platform fee and compute net amount */
function applyFee(
  grossAmountStr: string,
  decimals: number,
): { gross: string; fee: string; net: string } {
  const grossBig = BigInt(
    Math.round(parseFloat(grossAmountStr) * 10 ** decimals),
  );
  const feeBig = (grossBig * BigInt(PLATFORM_FEE_BPS)) / BigInt(10_000);
  const netBig = grossBig - feeBig;
  return {
    gross: formatUnits(grossBig, decimals),
    fee: formatUnits(feeBig, decimals),
    net: formatUnits(netBig, decimals),
  };
}

// ─── Get Uniswap V3 Quote ────────────────────────────────────────────────────

export async function getUniswapQuote(
  fromToken: SwapTokenSymbol,
  toToken: SwapTokenSymbol,
  amountIn: string,
  slippageBps: number = SWAP_CONFIG.DEFAULT_SLIPPAGE_BPS,
): Promise<SwapQuote> {
  if (!amountIn || parseFloat(amountIn) <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const client = getPublicClient();
  const fromAddr = getTokenAddress(fromToken);
  const toAddr = getTokenAddress(toToken);
  const fromDecimals = getTokenDecimals(fromToken);
  const toDecimals = getTokenDecimals(toToken);
  const amountInParsed = parseUnits(amountIn, fromDecimals);

  // Use QuoterV2 to get the expected output (read-only call via eth_call)
  const result = await client.simulateContract({
    address: UNISWAP_V3_CONTRACTS.QUOTER_V2 as Address,
    abi: QUOTER_V2_ABI,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn: fromAddr,
        tokenOut: toAddr,
        amountIn: amountInParsed,
        fee: UNISWAP_POOL_FEE,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });

  const amountOutRaw = result.result[0];
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
    route: 'uniswap-v3',
    slippageBps,
    isTradable: true,
    timestamp: Date.now(),
  };
}

// ─── Build Uniswap V3 Swap Transaction ───────────────────────────────────────

export async function buildUniswapSwapTransaction(
  fromToken: SwapTokenSymbol,
  toToken: SwapTokenSymbol,
  amountIn: string,
  userAddress: string,
  slippageBps: number = SWAP_CONFIG.DEFAULT_SLIPPAGE_BPS,
): Promise<SwapTransaction> {
  const quote = await getUniswapQuote(fromToken, toToken, amountIn, slippageBps);

  const fromAddr = getTokenAddress(fromToken);
  const toAddr = getTokenAddress(toToken);
  const fromDecimals = getTokenDecimals(fromToken);
  const amountInParsed = parseUnits(amountIn, fromDecimals);

  // Calculate minimum output with slippage tolerance
  const toDecimals = getTokenDecimals(toToken);
  const grossOut = parseUnits(quote.amountOutGross, toDecimals);
  const amountOutMinimum =
    grossOut - (grossOut * BigInt(slippageBps)) / BigInt(10_000);

  // Build exactInputSingle calldata
  const swapData = encodeFunctionData({
    abi: SWAP_ROUTER_ABI,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn: fromAddr,
        tokenOut: toAddr,
        fee: UNISWAP_POOL_FEE,
        recipient: userAddress as Address,
        amountIn: amountInParsed,
        amountOutMinimum,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });

  // Build approval tx if swapping FROM an ERC-20 (USDC/USDT → CELO)
  let approval: {
    to: Address;
    data: `0x${string}`;
  } | null = null;

  if (fromToken !== 'CELO') {
    const client = getPublicClient();
    const currentAllowance = await client.readContract({
      address: fromAddr,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress as Address, UNISWAP_V3_CONTRACTS.SWAP_ROUTER as Address],
    });

    if (BigInt(currentAllowance.toString()) < amountInParsed) {
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V3_CONTRACTS.SWAP_ROUTER as Address, amountInParsed],
      });
      approval = {
        to: fromAddr,
        data: approveData,
      };
    }
  }

  // For CELO → token swaps, we need to send native CELO value
  const isFromCelo = fromToken === 'CELO';

  return {
    approval,
    swap: {
      params: {
        to: UNISWAP_V3_CONTRACTS.SWAP_ROUTER as Address,
        data: swapData,
        ...(isFromCelo ? { value: amountInParsed } : {}),
      },
    },
    quote,
  };
}
