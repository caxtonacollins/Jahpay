"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiatInput } from "../inputs/fiat-input";
import { TokenInput } from "../inputs/token-input";
import { RateInfo } from "../rate-info";
import { ProviderSelector } from "../provider-selector";

interface OnrampPanelProps {
  onTransactionStart: () => void;
  onTransactionSuccess: (txHash?: string) => void;
  onTransactionError: (error: string) => void;
  isLoading: boolean;
}

export function OnrampPanel({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
}: OnrampPanelProps) {
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [fiatAmount, setFiatAmount] = useState("");
  const [cryptoToken, setCryptoToken] = useState("cUSD");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("yellowcard");

  const handleBuy = useCallback(async () => {
    if (!fiatAmount || !cryptoAmount) {
      onTransactionError("Please enter an amount");
      return;
    }

    if (!selectedProvider) {
      onTransactionError("Please select a payment provider");
      return;
    }

    try {
      onTransactionStart();
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2500));
      onTransactionSuccess("0x" + Math.random().toString(16).slice(2));
    } catch (error) {
      onTransactionError("Purchase failed. Please try again.");
    }
  }, [
    fiatAmount,
    cryptoAmount,
    selectedProvider,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
  ]);

  return (
    <div className="space-y-4">
      {/* Fiat Input */}
      <FiatInput
        label="You pay"
        currency={fiatCurrency}
        amount={fiatAmount}
        onCurrencyChange={setFiatCurrency}
        onAmountChange={setFiatAmount}
      />

      {/* Crypto Output */}
      <TokenInput
        label="You receive"
        token={cryptoToken}
        amount={cryptoAmount}
        onTokenChange={setCryptoToken}
        onAmountChange={setCryptoAmount}
        readOnly
      />

      {/* Rate Info */}
      {fiatAmount && cryptoAmount && (
        <RateInfo
          fromToken={fiatCurrency}
          toToken={cryptoToken}
          rate={parseFloat(cryptoAmount) / parseFloat(fiatAmount)}
          fee="2.5%"
        />
      )}

      {/* Provider Selection */}
      <ProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />

      {/* Buy Button */}
      <Button
        onClick={handleBuy}
        disabled={
          !fiatAmount || !cryptoAmount || !selectedProvider || isLoading
        }
        className="w-full h-12 text-base font-medium"
        variant="gradient"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Purchase...
          </>
        ) : (
          `Buy ${cryptoToken} with ${fiatCurrency}`
        )}
      </Button>
    </div>
  );
}
