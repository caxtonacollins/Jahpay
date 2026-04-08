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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onTransactionSuccess("0x" + Math.random().toString(16).slice(2));
    } catch (error) {
      onTransactionError("Swap failed. Please try again.");
    }
  }, [
    fromAmount,
    toAmount,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
  ]);

  return (
    <div className="space-y-4">
      {/* From Token */}
      <TokenInput
        label="You send"
        token={fromToken}
        amount={fromAmount}
        onTokenChange={setFromToken}
        onAmountChange={setFromAmount}
        balance="1,234.56"
      />

      {/* Switch Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleSwitch}
          disabled={isSwitching}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-lg bg-gradient-to-r from-celo-green/20 to-celo-gold/20 border border-celo-green/30 hover:border-celo-green/60 text-white transition-all disabled:opacity-50"
        >
          <ArrowDownUp className="w-5 h-5" />
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
        <RateInfo
          fromToken={fromToken}
          toToken={toToken}
          rate={parseFloat(toAmount) / parseFloat(fromAmount)}
          fee="0.5%"
        />
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!fromAmount || !toAmount || isLoading}
        className="w-full h-12 text-base font-medium"
        variant="gradient"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Swap...
          </>
        ) : (
          `Swap ${fromToken} to ${toToken}`
        )}
      </Button>
    </div>
  );
}
