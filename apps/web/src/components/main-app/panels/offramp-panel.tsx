import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenInput } from "../inputs/token-input";
import { FiatInput } from "../inputs/fiat-input";
import { RateInfo } from "../rate-info";
import { ProviderSelector } from "../provider-selector";
import { useMiniPay } from "@/hooks/useMiniPay";
import {
  getExchangeRate,
  approveToken,
  initiateOffRampContractCall,
  getTokenAddress,
} from "@/lib/minipay-utils";
import { toast } from "@/components/ui/use-toast";

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
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);

  const { userAddress } = useMiniPay();

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsFetchingQuote(true);
        const rate = await getExchangeRate(cryptoToken, fiatCurrency);
        setCurrentRate(rate);
        if (cryptoAmount) {
          setFiatAmount((parseFloat(cryptoAmount) * rate).toFixed(2));
        }
      } catch (error) {
        console.error("Failed to fetch rate:", error);
      } finally {
        setIsFetchingQuote(false);
      }
    };
    fetchRate();
  }, [cryptoToken, fiatCurrency]);

  // Update fiatAmount when cryptoAmount changes
  useEffect(() => {
    if (cryptoAmount && currentRate) {
      setFiatAmount((parseFloat(cryptoAmount) * currentRate).toFixed(2));
    } else {
      setFiatAmount("");
    }
  }, [cryptoAmount, currentRate]);

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

      // 1. Initiate with backend
      const response = await fetch("/api/ramp/off-ramp/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": userAddress || "0x...",
        },
        body: JSON.stringify({
          amount: parseFloat(cryptoAmount),
          crypto_currency: cryptoToken,
          fiat_currency: fiatCurrency,
          bank_account_id: "default", // Should be selected by user
          country_code: "NG",
          preferred_provider: selectedProvider,
        }),
      });

      if (!response.ok) throw new Error("Failed to initiate off-ramp");
      const initiationData = await response.json();

      // 2. Approve Token (if not native CELO)
      if (cryptoToken !== "CELO") {
        const tokenAddress = getTokenAddress(cryptoToken, 42220); // Default to mainnet chainId or detect
        await approveToken(tokenAddress, cryptoAmount);
        toast({ title: "Approved", description: "Token approval successful." });
      }

      // 3. Call Contract
      const txHash = await initiateOffRampContractCall(
        cryptoAmount,
        selectedProvider,
        fiatCurrency,
        fiatAmount,
        cryptoToken,
      );

      onTransactionSuccess(txHash);
      toast({
        title: "Off-ramp Started",
        description:
          "Your tokens are locked. Provider will process the fiat payment soon.",
      });
    } catch (error) {
      onTransactionError(
        error instanceof Error
          ? error.message
          : "Sale failed. Please try again.",
      );
    }
  }, [
    cryptoAmount,
    fiatAmount,
    cryptoToken,
    fiatCurrency,
    selectedProvider,
    userAddress,
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

      {/* Rate Info & Loading */}
      <div className="min-h-[20px]">
        {isFetchingQuote ? (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            Fetching best price...
          </div>
        ) : (
          cryptoAmount &&
          fiatAmount &&
          currentRate && (
            <RateInfo
              fromToken={cryptoToken}
              toToken={fiatCurrency}
              rate={currentRate}
              fee="2.5%"
            />
          )
        )}
      </div>

      {/* Provider Selection */}
      <ProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        fromCurrency={cryptoToken}
        toCurrency={fiatCurrency}
        amount={cryptoAmount}
      />

      {/* Sell Button */}
      <Button
        onClick={handleSell}
        disabled={
          !cryptoAmount ||
          !fiatAmount ||
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
            Processing Sale...
          </>
        ) : (
          `Sell ${cryptoToken} for ${fiatCurrency}`
        )}
      </Button>
    </div>
  );
}
