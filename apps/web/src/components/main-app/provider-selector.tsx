"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const PROVIDERS = [
  { id: "yellowcard", name: "Yellow Card", badge: "Popular" },
  { id: "cashramp", name: "Cashramp", badge: "Fast" },
  { id: "bitmama", name: "Bitmama", badge: "Secure" },
];

export function ProviderSelector({
  selectedProvider,
  onProviderChange,
}: ProviderSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-3">
        Payment Provider
      </label>

      <div className="grid grid-cols-3 gap-2">
        {PROVIDERS.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => onProviderChange(provider.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-3 rounded-lg border transition-all ${
              selectedProvider === provider.id
                ? "bg-celo-green/20 border-celo-green/60"
                : "bg-white/5 border-white/20 hover:border-white/40"
            }`}
          >
            <div className="text-sm font-medium text-white">
              {provider.name}
            </div>
            <div className="text-xs text-white/60 mt-1">{provider.badge}</div>

            {selectedProvider === provider.id && (
              <motion.div
                layoutId="selectedProvider"
                className="absolute inset-0 rounded-lg border-2 border-celo-green"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
