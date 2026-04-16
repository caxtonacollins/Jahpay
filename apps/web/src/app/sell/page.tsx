"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { SwapInterface } from "@/components/ramp/swap-interface";
import { useExchangeRate } from "@/lib/hooks/useProviders";
import { useBankAccounts } from "@/lib/hooks/useUser";
import { useInitiateOffRamp } from "@/lib/hooks/useTransactions";
import { toast } from "@/components/ui/use-toast";

export default function SellPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [amount, setAmount] = useState<string>("");
  const [fiatCurrency, setFiatCurrency] = useState<string>("NGN");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("cUSD");
  const [selectedProvider, setSelectedProvider] = useState<string>("yellowcard");

  const numericAmount = useMemo(() => parseFloat(amount || "0") || 0, [amount]);

  // For selling, we convert from crypto -> fiat
  const { data: rateData } = useExchangeRate(cryptoCurrency, fiatCurrency, numericAmount);
  const bestQuote = rateData?.bestQuote;

  const { data: bankData } = useBankAccounts(address);
  const defaultBankId = bankData?.accounts?.find((a: any) => a.is_default)?.id || bankData?.accounts?.[0]?.id;

  const { mutateAsync: initiateOffRamp, isPending } = useInitiateOffRamp(address);

  const handleSubmit = async () => {
    if (!address) {
      toast({ title: "Connect your wallet", description: "Please connect to continue", type: "warning" });
      return;
    }
    if (!defaultBankId) {
      toast({ title: "Add a bank account", description: "You need a bank account to cash out", type: "warning" });
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      toast({ title: "Enter an amount", description: "Amount must be greater than 0", type: "warning" });
      return;
    }

    try {
      const res = await initiateOffRamp({
        amount: numericAmount,
        crypto_currency: cryptoCurrency,
        fiat_currency: fiatCurrency,
        bank_account_id: defaultBankId,
        country_code: "NG",
        preferred_provider: selectedProvider,
      });

      toast({ title: "We got it", description: "Your cashout is on the way. We'll keep you posted.", type: "success" });
      if (res?.transaction_id) {
        router.push(`/transaction/${res.transaction_id}`);
      }
    } catch (e) {
      toast({ title: "We couldn’t start that", description: "Nothing was charged. Please try again.", type: "error" });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sell Crypto</h1>
      <SwapInterface
        type="sell"
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
