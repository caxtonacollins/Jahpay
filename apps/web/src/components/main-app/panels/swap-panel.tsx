"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenInput } from "../inputs/token-input";
import { RateInfo } from "../rate-info";

interface SwapPanelProps {
  onTransactionStart: () => void;
  onTransactionSuccess: (txHash?: string) => void;
  onTransactionError: (error: string) => void;
  isLoading: boolean;
}

export function SwapPanel({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
}: SwapPanelProps) {
  const [fromToken, setFromToken] = useState("CELO");
  const [toToken, setToToken] = useState("cUSD");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = useCallback(() => {
    setIsSwitching(true);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setTimeout(() => setIsSwitching(false), 300);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleSwap = useCallback(async () => {
    if (!fromAmount || !toAmount) {
      onTransactionError("Please enter an amount");
      return;
    }

    try {
      onTransactionStart();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onTransactionSuccess("0x" + Math.random().toString(16).slice(2));
    } catch (error) {
      onTransactionError("Swap failed. Please try again.");
    }
  }, [fromAmount, toAmount, onTransactionStart, onTransactionSuccess, onTransactionError]);

  return (
    <div className="space-y-2">
      {/* From Token */}
      <TokenInput
        label="You send"
        token={fromToken}
        amount={fromAmount}
        onTokenChange={setFromToken}
        onAmountChange={setFromAmount}
        balance="1,234.56"
      />

      {/* Premium Switch Button */}
      <div className="flex justify-center -my-1 relative z-10">
        <motion.button
          onClick={handleSwitch}
          disabled={isSwitching}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-10 h-10 rounded-xl bg-[#0d111c] border-2 border-white/[0.1] hover:border-brand-blue/50 text-white/60 hover:text-brand-blue flex items-center justify-center shadow-lg transition-colors duration-200 disabled:opacity-50"
        >
          <ArrowDownUp className="w-4 h-4" />
        </motion.button>
      </div>

      {/* To Token */}
      <TokenInput
        label="You receive"
        token={toToken}
        amount={toAmount}
        onTokenChange={setToToken}
        onAmountChange={setToAmount}
        balance="0.00"
        readOnly
      />

      {/* Rate Info */}
      {fromAmount && toAmount && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-1"
        >
          <RateInfo
            fromToken={fromToken}
            toToken={toToken}
            rate={parseFloat(toAmount) / parseFloat(fromAmount)}
            fee="0.5%"
          />
        </motion.div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!fromAmount || !toAmount || isLoading}
        className="w-full h-13 text-base font-semibold mt-2 rounded-xl"
        variant="gradient"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Swap...
          </>
        ) : (
          `Swap ${fromToken} → ${toToken}`
        )}
      </Button>
    </div>
  );
}
