"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenInput } from "../inputs/token-input";
import { FiatInput } from "../inputs/fiat-input";
import { RateInfo } from "../rate-info";
import { ProviderSelector } from "../provider-selector";

interface OfframpPanelProps {
  onTransactionStart: () => void;
  onTransactionSuccess: (txHash?: string) => void;
  onTransactionError: (error: string) => void;
  isLoading: boolean;
}

export function OfframpPanel({
  onTransactionStart,
  onTransactionSuccess,
  onTransactionError,
  isLoading,
}: OfframpPanelProps) {
  const [cryptoToken, setCryptoToken] = useState("cUSD");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [fiatAmount, setFiatAmount] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("yellowcard");

  const handleSell = useCallback(async () => {
    if (!cryptoAmount || !fiatAmount) {
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
      onTransactionError("Sale failed. Please try again.");
    }
  }, [
    cryptoAmount,
    fiatAmount,
    selectedProvider,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
  ]);

  return (
    <div className="space-y-4">
      {/* Crypto Input */}
      <TokenInput
        label="You send"
        token={cryptoToken}
        amount={cryptoAmount}
        onTokenChange={setCryptoToken}
        onAmountChange={setCryptoAmount}
        balance="5,432.10"
      />

      {/* Fiat Output */}
      <FiatInput
        label="You receive"
        currency={fiatCurrency}
        amount={fiatAmount}
        onCurrencyChange={setFiatCurrency}
        onAmountChange={setFiatAmount}
        readOnly
      />

      {/* Rate Info */}
      {cryptoAmount && fiatAmount && (
        <RateInfo
          fromToken={cryptoToken}
          toToken={fiatCurrency}
          rate={parseFloat(fiatAmount) / parseFloat(cryptoAmount)}
          fee="2.5%"
        />
      )}

      {/* Provider Selection */}
      <ProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />

      {/* Sell Button */}
      <Button
        onClick={handleSell}
        disabled={
          !cryptoAmount || !fiatAmount || !selectedProvider || isLoading
        }
        className="w-full h-12 text-base font-medium"
        variant="gradient"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Sale...
          </>
        ) : (
          `Sell ${cryptoToken} for ${fiatCurrency}`
        )}
      </Button>
    </div>
  );
}
