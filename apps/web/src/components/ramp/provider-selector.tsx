"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Provider {
  name: string;
  rate: number;
  fee: number;
  time: number;
  isRecommended?: boolean;
}

interface ProviderSelectorProps {
  providers: Provider[];
  onSelect: (provider: string) => void;
  loading?: boolean;
}

export function ProviderSelector({
  providers,
  onSelect,
  loading = false,
}: ProviderSelectorProps) {
  const [selected, setSelected] = useState<string>(providers[0]?.name || "");

  const handleSelect = (providerName: string) => {
    setSelected(providerName);
    onSelect(providerName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold text-white">Select Provider</h3>

      <div className="space-y-2">
        {providers.map((provider) => (
          <motion.button
            key={provider.name}
            onClick={() => handleSelect(provider.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selected === provider.name
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                  {selected === provider.name && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>

                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white capitalize">
                      {provider.name}
                    </span>
                    {provider.isRecommended && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
                        Best Rate
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right text-sm">
                <div className="text-white font-semibold">
                  Rate: {provider.rate.toFixed(2)}
                </div>
                <div className="text-white/60 text-xs">
                  Fee: {provider.fee.toFixed(2)}%
                </div>
                <div className="text-white/60 text-xs">~{provider.time}min</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
