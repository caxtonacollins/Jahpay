"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Loader2 } from "lucide-react";
import type { SwapQuote, SwapTokenSymbol } from "@/lib/swap/usdc-usdt-swap";
import { formatTokenAmount } from "@/lib/swap/usdc-usdt-swap";

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
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: style.bg }}
    >
      {style.text}
    </div>
  );
}

interface SwapConfirmModalProps {
  quote: SwapQuote;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  fromBalance?: string | null;
  toBalance?: string | null;
}

export function SwapConfirmModal({
  quote,
  onConfirm,
  onCancel,
  isLoading,
  fromBalance,
  toBalance,
}: SwapConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 16, opacity: 0 }}
        className="w-full max-w-sm relative z-10 rounded-3xl bg-[#0d111c]/80 backdrop-blur-2xl border border-white/[0.08] p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/[0.03] to-transparent pointer-events-none rounded-3xl" />
        
        <h3 className="text-xl font-bold text-white mb-6 relative z-10 text-center">Confirm Swap</h3>

        <div className="space-y-4 mb-8 relative z-10">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center gap-2">
              <TokenBadge symbol={quote.fromToken} size="sm" />
              <div>
                <span className="text-white font-semibold block">
                  {formatTokenAmount(quote.amountIn)} {quote.fromToken}
                </span>
                {fromBalance && (
                  <span className="text-xs text-white/40">
                    Bal: {parseFloat(fromBalance).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <ArrowDownUp className="w-4 h-4 text-white/40" />
            <div className="flex items-center gap-2">
              <TokenBadge symbol={quote.toToken} size="sm" />
              <div>
                <span className="text-brand-green font-bold text-lg block drop-shadow-[0_0_8px_rgba(38,161,123,0.3)]">
                  {formatTokenAmount(quote.amountOutNet)} {quote.toToken}
                </span>
                {toBalance && (
                  <span className="text-xs text-white/40">
                    Bal: {parseFloat(toBalance).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 px-2 pt-2 border-t border-white/[0.05]">
            {[
              {
                label: "Rate",
                value: `1 ${quote.fromToken} = ${quote.rate.toFixed(6)} ${quote.toToken}`,
              },
              {
                label: "Platform Fee (0.3%)",
                value: `${formatTokenAmount(quote.platformFee)} ${quote.toToken}`,
              },
              {
                label: "Route",
                value:
                  quote.route === "uniswap-v3"
                    ? "Uniswap V3"
                    : quote.route === "direct"
                      ? "Direct (Mento)"
                      : "via USDm (Mento)",
              },
              { label: "Slippage", value: `${quote.slippageBps / 100}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/40">{label}</span>
                <span className="text-white/80">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-2xl border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(39,117,202,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Swapping...
              </>
            ) : (
              "Confirm Swap"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
