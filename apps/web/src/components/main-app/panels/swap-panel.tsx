"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownUp,
  Loader2,
  AlertCircle,
  Info,
  Zap,
  ChevronDown,
} from "lucide-react";
import {
  getSwapTokenInfo,
  formatTokenAmount,
  isValidSwapPair,
  isCeloPair,
} from "@/lib/swap/usdc-usdt-swap";
import type { AgentRecommendation } from "@/lib/agent/erc8004-agent";
import { PLATFORM_FEE_PERCENT, SWAP_TOKENS } from "@/lib/minipay/constants";
import { useSwap } from "@/lib/hooks/use-swap";
import { useTokenBalances } from "@/lib/hooks/use-token-balances";
import { SwapConfirmModal } from "@/components/swap/swap-confirm-modal";
import { cn } from "@/lib/utils";
import type { SwapTokenSymbol } from "@/lib/swap/usdc-usdt-swap";

function TokenBadge({
  symbol,
  size = "lg",
}: {
  symbol: SwapTokenSymbol;
  size?: "sm" | "lg";
}) {
  const sz = size === "lg" ? "w-9 h-9 text-sm" : "w-6 h-6 text-[10px]";

  const getTokenStyle = (sym: SwapTokenSymbol) => {
    switch (sym) {
      case "USDC":
        return { bg: "linear-gradient(135deg,#2775CA,#1a5fa8)", text: "US" };
      case "USDT":
        return { bg: "linear-gradient(135deg,#26A17B,#1a7a5a)", text: "UT" };
      case "CELO":
        return { bg: "linear-gradient(135deg,#FCFF52,#35D07F)", text: "CE" };
    }
  };

  const style = getTokenStyle(symbol);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        sz,
      )}
      style={{ background: style.bg }}
    >
      {style.text}
    </div>
  );
}

function SlippageSelector({
  value,
  onChange,
  aiRecommended,
}: {
  value: number;
  onChange: (v: number) => void;
  aiRecommended?: number;
}) {
  const opts = [10, 50, 100];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40">Slippage</span>
      <div className="flex gap-1">
        {opts.map((bps) => (
          <button
            key={bps}
            onClick={() => onChange(bps)}
            className={cn(
              "px-2 py-1 rounded-lg text-xs font-medium transition-all",
              value === bps
                ? "bg-brand-blue text-white"
                : "bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white",
            )}
          >
            {bps / 100}%
            {aiRecommended === bps && (
              <span className="ml-1 text-[9px] text-yellow-400">AI</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TokenSelectorButton({
  symbol,
  onSelect,
  disabled = false,
  balance,
}: {
  symbol: SwapTokenSymbol;
  onSelect: (token: SwapTokenSymbol) => void;
  disabled?: boolean;
  balance?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const info = getSwapTokenInfo(symbol);
  const { balances } = useTokenBalances();

  const handleSelect = (token: SwapTokenSymbol) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] transition-all",
          !disabled && "hover:bg-white/[0.12] hover:border-white/[0.15]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {info.logo ? (
          <Image
            src={info.logo}
            alt={symbol}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <TokenBadge symbol={symbol} />
        )}
        <div>
          <div className="text-sm font-bold text-white">{symbol}</div>
          <div className="text-[10px] text-white/40">{info.name}</div>
        </div>
        {!disabled && <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 z-50 min-w-[220px] rounded-xl bg-[#0d111c] border border-white/[0.1] shadow-xl overflow-hidden"
            >
              {SWAP_TOKENS.map((token) => {
                const tokenInfo = getSwapTokenInfo(
                  token.symbol as SwapTokenSymbol,
                );
                const tokenBalance = balances[token.symbol as SwapTokenSymbol];
                return (
                  <button
                    key={token.symbol}
                    onClick={() =>
                      handleSelect(token.symbol as SwapTokenSymbol)
                    }
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 transition-colors",
                      token.symbol === symbol
                        ? "bg-brand-blue/20 text-white"
                        : "hover:bg-white/[0.05] text-white/80",
                    )}
                  >
                    {tokenInfo.logo ? (
                      <Image
                        src={tokenInfo.logo}
                        alt={token.symbol}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <TokenBadge
                        symbol={token.symbol as SwapTokenSymbol}
                        size="sm"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold">{token.symbol}</div>
                      <div className="text-[10px] text-white/40">
                        {tokenInfo.name}
                      </div>
                    </div>
                    {tokenBalance && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-white/80">
                          {parseFloat(tokenBalance).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {token.symbol}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SwapPanelProps {
  onTransactionStart: () => void;
  onTransactionSuccess: (txHash?: string) => void;
  onTransactionError: (error: string) => void;
  isLoading: boolean;
  onRecommendation?: (rec: AgentRecommendation) => void;
  /** Apply values suggested by the AI chat agent */
  externalSwapParams?: {
    amount: string;
    fromToken: SwapTokenSymbol;
    toToken: SwapTokenSymbol;
    slippageBps?: number;
  } | null;
}

export function SwapPanel({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
  onRecommendation,
  externalSwapParams,
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
      externalSwapParams={externalSwapParams}
    />
  );
}

function SwapPanelContent({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
  onRecommendation,
  externalSwapParams,
}: SwapPanelProps) {
  const swap = useSwap(onRecommendation);

  useEffect(() => {
    if (!externalSwapParams) return;
    swap.setFromToken(externalSwapParams.fromToken);
    swap.setFromAmount(externalSwapParams.amount);
    if (externalSwapParams.slippageBps) {
      swap.setSlippageBps(externalSwapParams.slippageBps);
    }
  }, [externalSwapParams]);

  const fromInfo = getSwapTokenInfo(swap.fromToken);
  const toInfo = getSwapTokenInfo(swap.toToken);

  const handleSwap = async () => {
    onTransactionStart?.();
    try {
      const txHash = await swap.executeSwap();
      if (txHash) onTransactionSuccess?.(txHash);
    } catch (err) {
      onTransactionError?.(err instanceof Error ? err.message : "Swap failed");
    }
  };

  return (
    <>
      <div className="space-y-0 relative">
        {/* Top Input Container */}
        <div className="rounded-t-3xl pt-4 px-4 pb-6 bg-white/[0.04] border border-white/[0.08] border-b-0 focus-within:border-brand-blue/50 focus-within:bg-white/[0.06] focus-within:shadow-[0_-5px_20px_rgba(39,117,202,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              You Send
            </span>
            <span className="text-xs text-white/40 font-mono">
              {swap.balance && (
                <>
                  Bal: {parseFloat(swap.balance).toFixed(2)} {swap.fromToken}
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={swap.fromAmount}
              onChange={(e) => swap.setFromAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="flex-1 bg-transparent text-4xl font-bold text-white placeholder-white/10 focus:outline-none min-w-0 transition-colors"
            />
            <TokenSelectorButton
              symbol={swap.fromToken}
              onSelect={swap.setFromToken}
              disabled={swap.isSwapping}
              balance={swap.balance}
            />
          </div>
        </div>

        {/* Swap Button - Positioned to overlap both containers */}
        <div className="flex items-center justify-center relative z-20 -my-5">
          <motion.button
            onClick={swap.handleSwitch}
            disabled={swap.isSwapping}
            whileHover={{ scale: 1.1, y: -1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-11 h-11 rounded-2xl bg-[#0d111c] border-2 border-white/[0.08] hover:border-brand-blue/60 text-white/60 hover:text-brand-blue flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(39,117,202,0.3)] transition-all duration-300"
          >
            <ArrowDownUp className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Bottom Input Container */}
        <div className="rounded-b-3xl pt-6 px-4 pb-4 bg-white/[0.02] border border-white/[0.08] border-t-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              You Receive
            </span>
            {swap.isFetchingQuote && (
              <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-4xl font-bold text-white/80">
              {swap.isFetchingQuote ? (
                <span className="text-white/20 animate-pulse">...</span>
              ) : swap.quote ? (
                <span className="text-brand-green drop-shadow-[0_0_10px_rgba(38,161,123,0.2)]">
                  {formatTokenAmount(swap.quote.amountOutNet)}
                </span>
              ) : (
                <span className="text-white/10">0.00</span>
              )}
            </div>
            <TokenSelectorButton
              symbol={swap.toToken}
              onSelect={swap.setToToken}
              disabled={swap.isSwapping}
            />
          </div>
        </div>

        <AnimatePresence>
          {swap.quote && !swap.isFetchingQuote && (
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
                    1 {swap.fromToken} = {swap.quote.rate.toFixed(6)}{" "}
                    {swap.toToken}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">
                    Platform Fee ({PLATFORM_FEE_PERCENT}%)
                  </span>
                  <span className="text-white/60">
                    {formatTokenAmount(swap.quote.platformFee)} {swap.toToken}
                  </span>
                </div>
                {swap.quote.route === "uniswap-v3" ? (
                  <div className="flex items-center gap-1.5 text-xs text-brand-blue/70">
                    <Zap className="w-3 h-3" />
                    <span>Uniswap V3 on Celo</span>
                  </div>
                ) : (
                  swap.quote.route === "via-usdm" && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400/70">
                      <Info className="w-3 h-3" />
                      <span>Routing via USDm for best price</span>
                    </div>
                  )
                )}
              </div>
              <div className="px-1 pt-1">
                <SlippageSelector
                  value={swap.slippageBps}
                  onChange={swap.setSlippageBps}
                  aiRecommended={swap.aiRec?.recommendedSlippageBps}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {swap.quoteError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-red-400 px-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {swap.quoteError}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => swap.setShowConfirm(true)}
          disabled={!swap.canSwap || isLoading}
          whileHover={swap.canSwap ? { scale: 1.02 } : {}}
          whileTap={swap.canSwap ? { scale: 0.98 } : {}}
          className={cn(
            "relative w-full h-14 rounded-2xl text-base font-bold transition-all duration-300 overflow-hidden mt-2",
            swap.canSwap
              ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-[0_0_30px_rgba(39,117,202,0.3)] hover:shadow-[0_0_40px_rgba(39,117,202,0.5)]"
              : "bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/[0.05]",
          )}
        >
          {swap.canSwap && (
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : !swap.isConnected ? (
              "Connect Wallet to Swap"
            ) : !swap.fromAmount ? (
              "Enter Amount"
            ) : swap.isFetchingQuote ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Fetching Quote...
              </>
            ) : swap.canSwap ? (
              <>
                {swap.aiRec?.showBadge && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm shadow-sm">
                    <Zap className="w-3 h-3" />
                    {swap.aiRec.badge}
                  </span>
                )}
                Swap {swap.fromToken} → {swap.toToken}
              </>
            ) : (
              "Swap"
            )}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {swap.showConfirm && swap.quote && (
          <SwapConfirmModal
            quote={swap.quote}
            onConfirm={handleSwap}
            onCancel={() => swap.setShowConfirm(false)}
            isLoading={swap.isSwapping}
            fromBalance={swap.balance}
          />
        )}
      </AnimatePresence>
    </>
  );
}
