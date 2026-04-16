"use client";

import React from "react";
import { Zap } from "lucide-react";

interface RateInfoProps {
  fromToken: string;
  toToken: string;
  rate: number;
  fee: string;
}

export function RateInfo({ fromToken, toToken, rate, fee }: RateInfoProps) {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      {/* Live rate */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full bg-brand-green shrink-0"
          style={{ animation: "live-pulse 2s ease-in-out infinite" }}
        />
        <span className="text-xs text-white/50">1 {fromToken}</span>
        <span className="text-xs text-white/30">=</span>
        <span className="text-xs font-mono font-medium text-white/80">
          {rate.toFixed(4)} {toToken}
        </span>
      </div>

      {/* Fee */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-brand-blue/70" />
        <span className="text-xs text-white/40">Fee</span>
        <span className="text-xs font-medium text-brand-blue/80">{fee}</span>
      </div>
    </div>
  );
}
