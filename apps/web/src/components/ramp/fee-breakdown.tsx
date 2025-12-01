"use client";

import { motion } from "framer-motion";

interface FeeItem {
  label: string;
  amount: number;
  percentage?: number;
}

interface FeeBreakdownProps {
  subtotal: number;
  fees: FeeItem[];
  total: number;
  currency?: string;
}

export function FeeBreakdown({
  subtotal,
  fees,
  total,
  currency = "USD",
}: FeeBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">Subtotal</span>
        <span className="text-white font-medium">
          {subtotal.toFixed(2)} {currency}
        </span>
      </div>

      {fees.map((fee, index) => (
        <motion.div
          key={fee.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-white/60">{fee.label}</span>
          <div className="text-right">
            <span className="text-white/80">
              {fee.amount.toFixed(2)} {currency}
            </span>
            {fee.percentage && (
              <span className="text-white/40 ml-2">({fee.percentage}%)</span>
            )}
          </div>
        </motion.div>
      ))}

      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
        <span className="text-white font-semibold">Total</span>
        <span className="text-white font-bold text-lg">
          {total.toFixed(2)} {currency}
        </span>
      </div>
    </motion.div>
  );
}
