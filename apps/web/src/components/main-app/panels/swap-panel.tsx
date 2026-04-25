import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenInput } from "../inputs/token-input";
import { RateInfo } from "../rate-info";
import { getExchangeRate, performSwap } from "@/lib/minipay/utils";

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
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // Fetch real exchange rate when tokens change
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsFetchingRate(true);
        const rate = await getExchangeRate(fromToken, toToken);
        setCurrentRate(rate);

        // Update toAmount if fromAmount exists
        if (fromAmount) {
          setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
        }
      } catch (error) {
        console.error("Failed to fetch rate:", error);
      } finally {
        setIsFetchingRate(false);
      }
    };

    fetchRate();
  }, [fromToken, toToken]);

  // Update toAmount when fromAmount changes
  useEffect(() => {
    if (fromAmount && currentRate) {
      setToAmount((parseFloat(fromAmount) * currentRate).toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, currentRate]);

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
      const txHash = await performSwap(fromToken, toToken, fromAmount);
      onTransactionSuccess(txHash);
    } catch (error) {
      onTransactionError(
        error instanceof Error
          ? error.message
          : "Swap failed. Please try again.",
      );
    }
  }, [
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
  ]);

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
      {(isFetchingRate || currentRate) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-1"
        >
          {isFetchingRate ? (
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Fetching best rate...
            </div>
          ) : (
            currentRate && (
              <RateInfo
                fromToken={fromToken}
                toToken={toToken}
                rate={currentRate}
                fee="0.5%"
              />
            )
          )}
        </motion.div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!fromAmount || !toAmount || isLoading || isFetchingRate}
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
