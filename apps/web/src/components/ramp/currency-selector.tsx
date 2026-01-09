"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  currencies: { value: string; label: string }[];
}

export function CurrencySelector({
  value,
  onChange,
  currencies,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCurrency = currencies.find((c) => c.value === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg flex items-center justify-between hover:bg-white/20 transition-colors"
      >
        <span className="text-white">{selectedCurrency?.label || "Select"}</span>
        <ChevronDown className="w-4 h-4 text-white/60" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/10 rounded-lg overflow-hidden z-50 backdrop-blur-md"
        >
          {currencies.map((currency) => (
            <button
              type="button"
              key={currency.value}
              onClick={() => {
                onChange(currency.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-white"
            >
              {currency.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
