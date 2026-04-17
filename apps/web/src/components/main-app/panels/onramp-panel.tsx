import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiatInput } from "../inputs/fiat-input";
import { TokenInput } from "../inputs/token-input";
import { RateInfo } from "../rate-info";
import { ProviderSelector } from "../provider-selector";
import { toast } from "@/components/ui/use-toast";
import { useMiniPay } from "@/hooks/useMiniPay";

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
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!fiatAmount || isNaN(parseFloat(fiatAmount))) {
        setCryptoAmount("");
        return;
      }

      try {
        setIsFetchingQuote(true);
        setQuoteError(null);

        // In a real app, this would be a specialized quote API
        // For now, we'll simulate a 1% fee and use a fixed rate
        // as we don't have a public quote endpoint ready yet in the provided files
        const rate = 1.0; // 1 USD = 1 cUSD for simulation
        const fee = 0.01; // 1%
        const receiveAmount = parseFloat(fiatAmount) * (1 - fee) * rate;

        setCryptoAmount(receiveAmount.toFixed(2));
      } catch (error) {
        setQuoteError("Failed to get quote");
        console.error(error);
      } finally {
        setIsFetchingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fiatAmount, fiatCurrency, cryptoToken]);

  const { userAddress } = useMiniPay();

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

      const response = await fetch("/api/ramp/on-ramp/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": userAddress || "0x...", // Use real user address
        },
        body: JSON.stringify({
          amount: parseFloat(cryptoAmount),
          crypto_currency: cryptoToken,
          fiat_currency: fiatCurrency,
          fiat_amount: parseFloat(fiatAmount),
          country_code: "NG", // Default or user-selected
          preferred_provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate on-ramp");
      }

      const data = await response.json();

      // Notify success
      onTransactionSuccess(data.transaction_id);

      toast({
        title: "Order Initiated",
        description: "Please complete the payment on the provider's platform.",
        action: {
          label: "Complete",
          onClick: () => {
            if (data.provider_url) window.open(data.provider_url, "_blank");
          },
        },
      });

      // Automatically open provider URL
      if (data.provider_url) {
        window.open(data.provider_url, "_blank");
      }
    } catch (error) {
      onTransactionError(
        error instanceof Error
          ? error.message
          : "Purchase failed. Please try again.",
      );
    }
  }, [
    fiatAmount,
    cryptoAmount,
    cryptoToken,
    fiatCurrency,
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

      {/* Rate Info & Quote Loading */}
      <div className="min-h-[20px]">
        {isFetchingQuote ? (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            Calculating best price...
          </div>
        ) : quoteError ? (
          <div className="text-xs text-red-500">{quoteError}</div>
        ) : (
          fiatAmount &&
          cryptoAmount && (
            <RateInfo
              fromToken={fiatCurrency}
              toToken={cryptoToken}
              rate={parseFloat(cryptoAmount) / parseFloat(fiatAmount)}
              fee="2.5%"
            />
          )
        )}
      </div>

      {/* Provider Selection */}
      <ProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        fromCurrency={fiatCurrency}
        toCurrency={cryptoToken}
        amount={fiatAmount}
      />

      {/* Buy Button */}
      <Button
        onClick={handleBuy}
        disabled={
          !fiatAmount ||
          !cryptoAmount ||
          !selectedProvider ||
          isLoading ||
          isFetchingQuote
        }
        className="w-full h-12 text-base font-medium"
        variant="gradient"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting to {selectedProvider}...
          </>
        ) : (
          `Buy ${cryptoToken} with ${fiatCurrency}`
        )}
      </Button>
    </div>
  );
}
