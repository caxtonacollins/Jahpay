"use client";

import React from "react";

interface FiatInputProps {
  label: string;
  currency: string;
  amount: string;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
  readOnly?: boolean;
}

const FIAT_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "NGN", symbol: "₦" },
  { code: "GHS", symbol: "₵" },
  { code: "KES", symbol: "KSh" },
  { code: "ZAR", symbol: "R" },
];

export function FiatInput({
  label,
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  readOnly = false,
}: FiatInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-3">
        {label}
      </label>

      <div className="flex gap-3">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celo-green/60 transition-colors appearance-none cursor-pointer pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "32px",
          }}
        >
          {FIAT_CURRENCIES.map((f) => (
            <option key={f.code} value={f.code}>
              {f.code} ({f.symbol})
            </option>
          ))}
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          readOnly={readOnly}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-celo-green/60 transition-colors disabled:opacity-50"
        />
      </div>
    </div>
  );
}
