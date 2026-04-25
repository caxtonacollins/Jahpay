"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  fromCurrency?: string;
  toCurrency?: string;
  amount?: string;
}

const PROVIDERS = [
  {
    id: "yellowcard",
    name: "Yellow Card",
    status: "active",
  },
  {
    id: "cashramp",
    name: "Cashramp",
    status: "coming-soon",
  },
  {
    id: "bitmama",
    name: "Bitmama",
    status: "coming-soon",
  },
];

export function ProviderSelector({
  selectedProvider,
  onProviderChange,
  fromCurrency = "USD",
  toCurrency = "cUSD",
  amount = "100",
}: ProviderSelectorProps) {
  const [rates, setRates] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      if (!amount || isNaN(parseFloat(amount))) {
        setRates({});
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/providers/rates", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Format rates for each provider
          const formattedRates: Record<string, string | null> = {};
          PROVIDERS.forEach((provider) => {
            const rate = data.rates?.[provider.id];
            if (rate) {
              formattedRates[provider.id] = `${rate}%`;
            } else {
              formattedRates[provider.id] = "N/A";
            }
          });
          setRates(formattedRates);
        }
      } catch (error) {
        console.error("Failed to fetch rates:", error);
        PROVIDERS.forEach((provider) => {
          setRates((prev) => ({ ...prev, [provider.id]: "N/A" }));
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div>
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
        Payment Provider
      </label>

      <div className="grid grid-cols-3 gap-2">
        {PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;
          const rate = rates[provider.id];
          const isComingSoon = provider.status === "coming-soon";

          return (
            <motion.button
              key={provider.id}
              onClick={() => !isComingSoon && onProviderChange(provider.id)}
              whileHover={!isComingSoon ? { scale: 1.02 } : {}}
              whileTap={!isComingSoon ? { scale: 0.98 } : {}}
              disabled={isComingSoon}
              className={cn(
                "relative p-3 rounded-xl border transition-all duration-200 text-left",
                isComingSoon
                  ? "bg-white/[0.02] border-white/[0.05] cursor-not-allowed opacity-50"
                  : isSelected
                    ? "bg-brand-blue/[0.08] border-brand-blue/50"
                    : "bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06]",
              )}
            >
              {/* Selected indicator */}
              {isSelected && !isComingSoon && (
                <motion.div
                  layoutId="providerSelection"
                  className="absolute inset-0 rounded-xl border-2 border-brand-blue/60 pointer-events-none"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}

              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-semibold text-white leading-tight">
                  {provider.name}
                </span>
                {isSelected && !isComingSoon && (
                  <Check className="w-3 h-3 text-brand-blue shrink-0 mt-0.5" />
                )}
              </div>

              <div className="flex items-center gap-1">
                {isComingSoon ? (
                  <span className="text-[10px] font-medium text-white/40">
                    Coming soon
                  </span>
                ) : loading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />
                ) : (
                  <span className="text-[10px] font-medium text-brand-blue">
                    {rate || "Loading..."}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
