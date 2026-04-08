"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface TokenInputProps {
  label: string;
  token: string;
  amount: string;
  onTokenChange: (token: string) => void;
  onAmountChange: (amount: string) => void;
  balance?: string;
  readOnly?: boolean;
}

const TOKENS = ["CELO", "cUSD", "cEUR", "USDC", "USDT", "ETH", "BTC"];

export function TokenInput({
  label,
  token,
  amount,
  onTokenChange,
  onAmountChange,
  balance,
  readOnly = false,
}: TokenInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-white/80">{label}</label>
        {balance && (
          <button
            onClick={() => onAmountChange(balance.replace(/,/g, ""))}
            className="text-xs text-celo-green hover:text-celo-gold transition-colors"
          >
            Balance: {balance}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          readOnly={readOnly}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-celo-green/60 transition-colors disabled:opacity-50"
        />

        <select
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celo-green/60 transition-colors appearance-none cursor-pointer pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "32px",
          }}
        >
          {TOKENS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
