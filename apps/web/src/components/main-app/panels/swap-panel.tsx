"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Loader2, AlertCircle, Info, Zap } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import {
  getSwapQuote,
  buildSwapTransaction,
  getSwapTokenInfo,
  getOppositeToken,
  formatTokenAmount,
} from "@/lib/swap/usdc-usdt-swap";
import {
  getSwapRecommendation,
  submitSwapFeedback,
} from "@/lib/agent/erc8004-agent";
import type { SwapQuote } from "@/types/swap";
import type { AgentRecommendation } from "@/types/agent";
import { SWAP_CONFIG, PLATFORM_FEE_PERCENT } from "@/lib/minipay/constants";
import { TokenBadge } from "@/components/ui/token-badge";
import { SlippageSelector } from "@/components/ui/slippage-selector";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";

// ─── Main SwapPanel ───────────────────────────────────────────────────────────

interface SwapPanelProps {
  onTransactionStart: () => void;
  onTransactionSuccess: (txHash?: string) => void;
  onTransactionError: (error: string) => void;
  isLoading: boolean;
  onRecommendation?: (rec: AgentRecommendation) => void;
}

export function SwapPanel({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
  onRecommendation,
}: SwapPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64" />;
  }

  return (
    <SwapPanelContent
      onTransactionStart={onTransactionStart}
      onTransactionSuccess={onTransactionSuccess}
      onTransactionError={onTransactionError}
      isLoading={isLoading}
      onRecommendation={onRecommendation}
    />
  );
}

function SwapPanelContent({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
  onRecommendation,
}: SwapPanelProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [fromToken, setFromToken] = useState<"USDC" | "USDT">("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [slippageBps, setSlippageBps] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [aiRec, setAiRec] = useState<AgentRecommendation | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toToken = getOppositeToken(fromToken);
  const fromInfo = getSwapTokenInfo(fromToken);
  const toInfo = getSwapTokenInfo(toToken);

  // Fetch quote with debounce
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
        const [q, rec] = await Promise.all([
          getSwapQuote(fromToken, toToken, fromAmount, slippageBps),
          getSwapRecommendation(fromAmount, fromToken),
        ]);
        setQuote(q);
        setAiRec(rec);
        setSlippageBps(rec.recommendedSlippageBps);
        onRecommendation?.(rec);
      } catch (err) {
        setQuoteError(
          err instanceof Error ? err.message : "Failed to fetch quote",
        );
        setQuote(null);
      } finally {
        setIsFetchingQuote(false);
      }
    }, SWAP_CONFIG.QUOTE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fromAmount, fromToken, toToken, slippageBps, onRecommendation]);

  const handleSwitch = useCallback(() => {
    setIsSwitching(true);
    setFromToken(toToken);
    setFromAmount(quote ? formatTokenAmount(quote.amountOutNet) : "");
    setQuote(null);
    setTimeout(() => setIsSwitching(false), 300);
  }, [toToken, quote]);

  const handleSwap = useCallback(async () => {
    if (!quote || !address || !walletClient) return;
    setIsSwapping(true);
    onTransactionStart?.();
    try {
      const { approval, swap } = await buildSwapTransaction(
        fromToken,
        toToken,
        fromAmount,
        address,
        slippageBps,
      );

      if (approval) {
        await walletClient.sendTransaction(approval as any);
      }

      const txHash = await walletClient.sendTransaction(swap.params as any);
      await submitSwapFeedback(quote, txHash, true);
      onTransactionSuccess?.(txHash);
      setFromAmount("");
      setQuote(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      await submitSwapFeedback(quote, "", false).catch(() => {});
      onTransactionError?.(msg);
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
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
  ]);

  const canSwap =
    isConnected &&
    !!quote &&
    !!fromAmount &&
    parseFloat(fromAmount) > 0 &&
    !isFetchingQuote;

  return (
    <>
      <div className="space-y-2">
        {/* FROM input */}
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.07] focus-within:border-brand-blue/40 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              You Send
            </span>
            <span className="text-xs text-white/30 font-mono">
              ≈ ${formatTokenAmount(fromAmount || "0")} USD
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="flex-1 bg-transparent text-3xl font-bold text-white placeholder-white/15 focus:outline-none min-w-0"
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1]">
              <TokenBadge symbol={fromToken} />
              <div>
                <div className="text-sm font-bold text-white">{fromToken}</div>
                <div className="text-[10px] text-white/40">{fromInfo.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Switch button */}
        <div className="flex items-center justify-center -my-1 relative z-10">
          <motion.button
            onClick={handleSwitch}
            disabled={isSwitching || isSwapping}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-10 h-10 rounded-xl bg-[#0d111c] border-2 border-white/[0.1] hover:border-brand-blue/50 text-white/50 hover:text-brand-blue flex items-center justify-center shadow-lg transition-colors"
          >
            <ArrowDownUp className="w-4 h-4" />
          </motion.button>
        </div>

        {/* TO output */}
        <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              You Receive
            </span>
            {isFetchingQuote && (
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-3xl font-bold text-white/80">
              {isFetchingQuote ? (
                <span className="text-white/20 animate-pulse">...</span>
              ) : quote ? (
                <span className="text-brand-green">
                  {formatTokenAmount(quote.amountOutNet)}
                </span>
              ) : (
                <span className="text-white/15">0.00</span>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.07]">
              <TokenBadge symbol={toToken} />
              <div>
                <div className="text-sm font-bold text-white">{toToken}</div>
                <div className="text-[10px] text-white/40">{toInfo.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote details */}
        <AnimatePresence>
          {quote && !isFetchingQuote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 py-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Rate</span>
                  <span className="text-white/60 font-mono">
                    1 {fromToken} = {quote.rate.toFixed(6)} {toToken}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">
                    Platform Fee ({PLATFORM_FEE_PERCENT}%)
                  </span>
                  <span className="text-white/60">
                    {formatTokenAmount(quote.platformFee)} {toToken}
                  </span>
                </div>
                {quote.route === "via-usdm" && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400/70">
                    <Info className="w-3 h-3" />
                    <span>Routing via USDm for best price</span>
                  </div>
                )}
              </div>

              {/* Slippage */}
              <div className="px-1 pt-1">
                <SlippageSelector
                  value={slippageBps}
                  onChange={setSlippageBps}
                  aiRecommended={aiRec?.recommendedSlippageBps}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {quoteError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-red-400 px-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {quoteError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <motion.button
          onClick={() => setShowConfirm(true)}
          disabled={!canSwap || isLoading}
          whileHover={canSwap ? { scale: 1.01 } : {}}
          whileTap={canSwap ? { scale: 0.99 } : {}}
          className={cn(
            "relative w-full h-14 rounded-2xl text-base font-bold transition-all duration-200 overflow-hidden",
            canSwap
              ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40"
              : "bg-white/[0.05] text-white/20 cursor-not-allowed",
          )}
        >
          {canSwap && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : !isConnected ? (
              "Connect Wallet to Swap"
            ) : !fromAmount ? (
              "Enter Amount"
            ) : isFetchingQuote ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching Quote...
              </>
            ) : canSwap ? (
              <>
                {aiRec?.showBadge && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                    <Zap className="w-3 h-3" />
                    {aiRec.badge}
                  </span>
                )}
                Swap {fromToken} → {toToken}
              </>
            ) : (
              "Swap"
            )}
          </span>
        </motion.button>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && quote && (
          <ConfirmModal
            isOpen={showConfirm}
            quote={quote}
            onConfirm={handleSwap}
            onCancel={() => setShowConfirm(false)}
            isLoading={isSwapping}
          />
        )}
      </AnimatePresence>
    </>
  );
}
