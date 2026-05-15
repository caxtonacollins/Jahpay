/**
 * Confirm Modal Component
 * Displays swap confirmation details before execution
 */

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SwapQuote } from "@/types/swap";
import { formatTokenAmount } from "@/lib/swap/usdc-usdt-swap";
import { TokenBadge } from "./token-badge";
import { ArrowDownUp } from "lucide-react";

interface ConfirmModalProps {
  isOpen?: boolean;
  isLoading?: boolean;
  title?: string;
  message?: string;
  details?: Record<string, string | number>;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "success" | "error";
  quote?: SwapQuote;
}

export function ConfirmModal({
  isOpen = true,
  isLoading = false,
  title = "Confirm Swap",
  message,
  details,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  quote,
}: ConfirmModalProps) {
  const variantStyles = {
    default: "border-brand-blue/30 bg-brand-blue/5",
    success: "border-green-500/30 bg-green-500/5",
    error: "border-red-500/30 bg-red-500/5",
  };

  const variantIcons = {
    default: null,
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
  };

  // If quote is provided, build details from it
  const displayDetails = quote
    ? {
        Rate: `1 ${quote.fromToken} = ${quote.rate.toFixed(6)} ${quote.toToken}`,
        "Platform Fee (0.3%)": `${formatTokenAmount(quote.platformFee)} ${quote.toToken}`,
        Route: quote.route === "direct" ? "Direct" : "USDC → USDm → USDT",
        Slippage: `${quote.slippageBps / 100}%`,
      }
    : details;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "rounded-2xl border p-6 max-w-sm w-full mx-4",
              variantStyles[variant],
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              {variantIcons[variant]}
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                {message && (
                  <p className="text-sm text-white/60 mt-1">{message}</p>
                )}
              </div>
            </div>

            {quote && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] mb-4">
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
            )}

            {displayDetails && (
              <div className="bg-white/5 rounded-lg p-3 mb-4 space-y-2">
                {Object.entries(displayDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-white/50">{key}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
