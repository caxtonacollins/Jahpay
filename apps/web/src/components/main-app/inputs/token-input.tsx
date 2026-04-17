"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TokenInputProps {
  label: string;
  token: string;
  amount: string;
  onTokenChange: (token: string) => void;
  onAmountChange: (amount: string) => void;
  balance?: string;
  readOnly?: boolean;
}

const TOKENS = [
  { symbol: "CELO", name: "Celo", color: "#FCFF52" },
  { symbol: "cUSD", name: "Celo Dollar", color: "#00d79b" },
  { symbol: "cEUR", name: "Celo Euro", color: "#3b82f6" },
  { symbol: "USDC", name: "USD Coin", color: "#2775CA" },
  { symbol: "USDT", name: "Tether", color: "#26A17B" },
  { symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
];

function TokenIcon({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0"
      style={{ backgroundColor: color }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

export function TokenInput({
  label,
  token,
  amount,
  onTokenChange,
  onAmountChange,
  balance,
  readOnly = false,
}: TokenInputProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedToken = TOKENS.find((t) => t.symbol === token) ?? TOKENS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.07] focus-within:border-brand-blue/40 focus-within:bg-white/[0.06] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
          {label}
        </span>
        {balance && (
          <button
            onClick={() => onAmountChange(balance.replace(/,/g, ""))}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-brand-blue transition-colors group"
          >
            <span className="font-mono">Balance: {balance}</span>
            <span className="text-[10px] text-brand-blue/60 group-hover:text-brand-blue transition-colors font-medium">
              MAX
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Amount input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          readOnly={readOnly}
          className={cn(
            "flex-1 bg-transparent text-2xl font-semibold text-white placeholder-white/20",
            "focus:outline-none min-w-0",
            readOnly && "text-white/50 cursor-default",
          )}
        />

        {/* Token selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl",
              "bg-white/[0.08] border border-white/[0.1]",
              "hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200",
              "text-white text-sm font-semibold",
            )}
          >
            <TokenIcon
              symbol={selectedToken.symbol}
              color={selectedToken.color}
            />
            <span>{selectedToken.symbol}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-white/50 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#111827] border border-white/[0.1] shadow-2xl shadow-black/60 z-[100] overflow-hidden py-1"
              >
                {TOKENS.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => {
                      onTokenChange(t.symbol);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <TokenIcon symbol={t.symbol} color={t.color} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {t.symbol}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {t.name}
                      </div>
                    </div>
                    {t.symbol === token && (
                      <Check className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
