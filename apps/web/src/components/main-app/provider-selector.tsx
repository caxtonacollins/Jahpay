"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const PROVIDERS = [
  {
    id: "yellowcard",
    name: "Yellow Card",
    badge: "Popular",
    badgeColor: "text-celo-gold bg-celo-gold/10",
    description: "Best rates",
  },
  {
    id: "cashramp",
    name: "Cashramp",
    badge: "Fast",
    badgeColor: "text-blue-400 bg-blue-400/10",
    description: "Instant",
  },
  {
    id: "bitmama",
    name: "Bitmama",
    badge: "Secure",
    badgeColor: "text-celo-green bg-celo-green/10",
    description: "Verified",
  },
];

export function ProviderSelector({
  selectedProvider,
  onProviderChange,
}: ProviderSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
        Payment Provider
      </label>

      <div className="grid grid-cols-3 gap-2">
        {PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;
          return (
            <motion.button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative p-3 rounded-xl border transition-all duration-200 text-left",
                isSelected
                  ? "bg-celo-green/[0.08] border-celo-green/50"
                  : "bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06]"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="providerSelection"
                  className="absolute inset-0 rounded-xl border-2 border-celo-green/60 pointer-events-none"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}

              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-semibold text-white leading-tight">
                  {provider.name}
                </span>
                {isSelected && (
                  <Check className="w-3 h-3 text-celo-green shrink-0 mt-0.5" />
                )}
              </div>

              <div
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                  provider.badgeColor
                )}
              >
                {provider.badge}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
