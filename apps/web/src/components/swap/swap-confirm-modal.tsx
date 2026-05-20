"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Loader2 } from "lucide-react";
import type { SwapQuote } from "@/lib/swap/usdc-usdt-swap";
import { formatTokenAmount } from "@/lib/swap/usdc-usdt-swap";

function TokenBadge({
  symbol,
  size = "lg",
}: {
  symbol: "USDC" | "USDT";
  size?: "sm" | "lg";
}) {
  const isUSDC = symbol === "USDC";
  const sz = size === "lg" ? "w-9 h-9 text-sm" : "w-6 h-6 text-[10px]";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{
        background: isUSDC
          ? "linear-gradient(135deg,#2775CA,#1a5fa8)"
          : "linear-gradient(135deg,#26A17B,#1a7a5a)",
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

interface SwapConfirmModalProps {
  quote: SwapQuote;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SwapConfirmModal({
  quote,
  onConfirm,
  onCancel,
  isLoading,
}: SwapConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-sm bg-[#0d111c] border border-white/[0.1] rounded-2xl p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white mb-6">Confirm Swap</h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <TokenBadge symbol={quote.fromToken} size="sm" />
              <span className="text-white font-semibold">
                {formatTokenAmount(quote.amountIn)} {quote.fromToken}
              </span>
            </div>
            <ArrowDownUp className="w-4 h-4 text-white/40" />
            <div className="flex items-center gap-2">
              <TokenBadge symbol={quote.toToken} size="sm" />
              <span className="text-brand-green font-semibold">
                {formatTokenAmount(quote.amountOutNet)} {quote.toToken}
              </span>
            </div>
          </div>

          <div className="space-y-2 px-1">
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
                  quote.route === "direct" ? "Direct" : "USDC → USDm → USDT",
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

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-green text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
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
