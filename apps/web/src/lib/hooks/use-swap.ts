"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useWalletClient, useChainId, usePublicClient } from "wagmi";
import {
  getSwapQuote,
  buildSwapTransaction,
  formatTokenAmount,
  isCeloPair,
  type SwapQuote,
  type SwapTokenSymbol,
} from "@/lib/swap/usdc-usdt-swap";
import { getSwapRecommendation } from "@/lib/agent/erc8004-agent";
import type { AgentRecommendation } from "@/lib/agent/erc8004-agent";
import { SWAP_CONFIG } from "@/lib/minipay/constants";
import {
  TransactionStatus,
  TransactionType,
} from "@/lib/transactions/types";
import { useTransactions } from "@/contexts/transactions-context";
import { getStablecoinBalance } from "@/lib/minipay/utils";
import { categorizeError, retryWithBackoff, logError } from "@/lib/errors/error-handler";

export function useSwap(onRecommendation?: (rec: AgentRecommendation) => void) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const { createTransaction } = useTransactions();

  const [fromToken, setFromTokenState] = useState<SwapTokenSymbol>("USDC");
  const [toToken, setToTokenState] = useState<SwapTokenSymbol>("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [slippageBps, setSlippageBps] = useState(SWAP_CONFIG.DEFAULT_SLIPPAGE_BPS);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [aiRec, setAiRec] = useState<AgentRecommendation | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smart token setters that prevent same token selection
  const setFromToken = useCallback((token: SwapTokenSymbol) => {
    if (token === toToken) {
      // Swap the tokens if user selects the same token
      setToTokenState(fromToken);
    }
    setFromTokenState(token);
    setQuote(null);
  }, [fromToken, toToken]);

  const setToToken = useCallback((token: SwapTokenSymbol) => {
    if (token === fromToken) {
      // Swap the tokens if user selects the same token
      setFromTokenState(toToken);
    }
    setToTokenState(token);
    setQuote(null);
  }, [fromToken, toToken]);

  // Fetch balance when address or fromToken changes
  useEffect(() => {
    if (!address || !isConnected) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setIsCheckingBalance(true);
      try {
        const bal = await getStablecoinBalance(address, fromToken, chainId);
        setBalance(bal);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance(null);
      } finally {
        setIsCheckingBalance(false);
      }
    };

    fetchBalance();
  }, [address, fromToken, chainId, isConnected]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetchingQuote(true);
      setQuoteError(null);
      try {
        // Check balance before fetching quote
        if (balance && parseFloat(fromAmount) > parseFloat(balance)) {
          setQuoteError(
            `Insufficient ${fromToken} balance. You have ${parseFloat(balance).toFixed(2)} ${fromToken}`
          );
          setQuote(null);
          setIsFetchingQuote(false);
          return;
        }

        // Use retry logic for quote fetching
        const [q, rec] = await retryWithBackoff(
          async () => Promise.all([
            getSwapQuote(fromToken, toToken, fromAmount, slippageBps, chainId),
            getSwapRecommendation(fromAmount, fromToken, chainId),
          ]),
          2, // Max 2 retries
          1000 // 1 second base delay
        );

        setQuote(q);
        setAiRec(rec);
        const shouldAutoApplySlippage =
          !aiRec || slippageBps === aiRec.recommendedSlippageBps;
        if (
          shouldAutoApplySlippage &&
          slippageBps !== rec.recommendedSlippageBps
        ) {
          setSlippageBps(rec.recommendedSlippageBps);
        }
        onRecommendation?.(rec);
      } catch (err) {
        const categorized = categorizeError(err);
        logError('Quote Fetch', err, { fromToken, toToken, fromAmount });
        setQuoteError(categorized.userMessage);
        setQuote(null);
      } finally {
        setIsFetchingQuote(false);
      }
    }, SWAP_CONFIG.QUOTE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fromAmount, fromToken, toToken, slippageBps, chainId, onRecommendation, balance, aiRec]);

  const handleSwitch = useCallback(() => {
    const tempToken = fromToken;
    setFromTokenState(toToken);
    setToTokenState(tempToken);
    setFromAmount(quote ? formatTokenAmount(quote.amountOutNet) : "");
    setQuote(null);
  }, [fromToken, toToken, quote]);

  const executeSwap = useCallback(async () => {
    if (!quote || !address || !walletClient) return null;

    // Final balance check before execution
    if (balance && parseFloat(fromAmount) > parseFloat(balance)) {
      throw new Error(
        `Insufficient ${fromToken} balance. You have ${parseFloat(balance).toFixed(2)} ${fromToken}`
      );
    }

    setIsSwapping(true);
    try {
      const { approval, swap } = await buildSwapTransaction(
        fromToken,
        toToken,
        fromAmount,
        address,
        slippageBps,
        chainId,
      );

      if (approval) {
        await walletClient.sendTransaction(approval as Parameters<typeof walletClient.sendTransaction>[0]);
      }

      const txHash = await walletClient.sendTransaction(
        swap.params as Parameters<typeof walletClient.sendTransaction>[0],
      );

      const providerName = isCeloPair(fromToken, toToken) ? "Uniswap V3" : "Mento Protocol";

      createTransaction(
        TransactionType.SWAP,
        {
          type: TransactionType.SWAP,
          fromAmount,
          toAmount: quote.amountOutNet,
          provider: providerName,
          rate: quote.rate,
          fee: quote.platformFee,
          minAmount: "0",
          maxAmount: "0",
          estimatedTime: "Instant",
          metadata: {
            providerName,
            fromAddress: fromToken,
            toAddress: toToken,
            feeCurrency: toToken,
            txHash,
            timestamp: Date.now(),
          },
        },
        {
          providerName,
          fromAddress: fromToken,
          toAddress: toToken,
          feeCurrency: toToken,
          txHash,
        },
        TransactionStatus.COMPLETED,
      );

      try {
        await fetch("/api/transactions/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            type: "swap",
            fromToken,
            toToken,
            amountIn: fromAmount,
            amountOut: quote.amountOutNet,
            platformFee: quote.platformFee,
            txHash,
            status: "success",
          }),
        });
      } catch {
        // localStorage already persisted via createTransaction
      }

      await fetch("/api/agent/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, txHash, success: true }),
      }).catch(() => { });

      setFromAmount("");
      setQuote(null);
      return txHash;
    } catch (err) {
      const categorized = categorizeError(err);
      logError('Swap Execution', err, { fromToken, toToken, fromAmount, quote });

      await fetch("/api/agent/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, txHash: "", success: false }),
      }).catch(() => { });

      throw new Error(categorized.userMessage);
    } finally {
      setIsSwapping(false);
      setShowConfirm(false);
    }
  }, [
    quote,
    address,
    walletClient,
    fromToken,
    toToken,
    fromAmount,
    slippageBps,
    chainId,
    createTransaction,
    balance,
  ]);

  const canSwap =
    isConnected &&
    !!quote &&
    !!fromAmount &&
    parseFloat(fromAmount) > 0 &&
    !isFetchingQuote &&
    (!balance || parseFloat(fromAmount) <= parseFloat(balance));

  return {
    fromToken,
    setFromToken,
    fromAmount,
    setFromAmount,
    toToken,
    setToToken,
    quote,
    isFetchingQuote,
    quoteError,
    slippageBps,
    setSlippageBps,
    showConfirm,
    setShowConfirm,
    isSwapping,
    aiRec,
    handleSwitch,
    executeSwap,
    canSwap,
    isConnected,
    chainId,
    balance,
    isCheckingBalance,
  };
}
