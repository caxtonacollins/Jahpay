"use client";

import React from "react";
import { Info } from "lucide-react";

interface RateInfoProps {
  fromToken: string;
  toToken: string;
  rate: number;
  fee: string;
}

export function RateInfo({ fromToken, toToken, rate, fee }: RateInfoProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Exchange Rate</span>
        <span className="text-sm font-mono text-white">
          1 {fromToken} = {rate.toFixed(6)} {toToken}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Platform Fee</span>
        <span className="text-sm font-medium text-white">{fee}</span>
      </div>

      <div className="flex items-start gap-2 pt-2 border-t border-white/10">
        <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50">
          Rates are updated in real-time. Final amount may vary based on network
          conditions.
        </p>
      </div>
    </div>
  );
}
