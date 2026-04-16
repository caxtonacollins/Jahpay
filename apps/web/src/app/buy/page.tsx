"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { SwapInterface } from "@/components/ramp/swap-interface";
import { useExchangeRate, useProviders } from "@/lib/hooks/useProviders";
import { useInitiateOnRamp } from "@/lib/hooks/useTransactions";
import { toast } from "@/components/ui/use-toast";

export default function BuyPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [amount, setAmount] = useState<string>("");
  const [fiatCurrency, setFiatCurrency] = useState<string>("NGN");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("cUSD");
  const [selectedProvider, setSelectedProvider] = useState<string>("yellowcard");

  const numericAmount = useMemo(() => parseFloat(amount || "0") || 0, [amount]);

  const { data: rateData } = useExchangeRate(fiatCurrency, cryptoCurrency, numericAmount);
  const bestQuote = rateData?.bestQuote;

  useEffect(() => {
    if (bestQuote?.provider) {
      setSelectedProvider(bestQuote.provider);
    }
  }, [bestQuote?.provider]);

  const { mutateAsync: initiateOnRamp, isPending } = useInitiateOnRamp(address);

  const handleSubmit = async () => {
    if (!address) {
      toast({ title: "Connect your wallet", description: "Please connect to continue", type: "warning" });
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      toast({ title: "Enter an amount", description: "Amount must be greater than 0", type: "warning" });
      return;
    }

    try {
      const res = await initiateOnRamp({
        amount: numericAmount,
        crypto_currency: cryptoCurrency,
        fiat_currency: fiatCurrency,
        fiat_amount: numericAmount,
        country_code: "NG",
        preferred_provider: selectedProvider,
      });

      toast({ title: "Checkout created", description: "Follow the next step to complete payment", type: "success" });
      if (res?.transaction_id) {
        router.push(`/transaction/${res.transaction_id}`);
      }
    } catch (e) {
      toast({ title: "We couldn’t start that", description: "Nothing was charged. Please try again.", type: "error" });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Buy Crypto</h1>
      <SwapInterface
        type="buy"
        amount={amount}
        onAmountChange={setAmount}
        fiatCurrency={fiatCurrency}
        onFiatChange={setFiatCurrency}
        cryptoCurrency={cryptoCurrency}
        onCryptoChange={setCryptoCurrency}
        exchangeRate={bestQuote}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
