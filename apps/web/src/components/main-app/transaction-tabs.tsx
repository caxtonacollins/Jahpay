"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionType = "swap" | "onramp" | "offramp";

interface TransactionTabsProps {
  activeTab: TransactionType;
  onTabChange: (tab: TransactionType) => void;
}

const tabs: Array<{
  id: TransactionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: "swap",
    label: "Swap",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    description: "Exchange crypto tokens",
  },
  {
    id: "onramp",
    label: "Buy Crypto",
    icon: <TrendingUp className="w-5 h-5" />,
    description: "Fiat to crypto",
  },
  {
    id: "offramp",
    label: "Sell Crypto",
    icon: <TrendingDown className="w-5 h-5" />,
    description: "Crypto to fiat",
  },
];

export function TransactionTabs({
  activeTab,
  onTabChange,
}: TransactionTabsProps) {
  return (
    <div className="flex gap-2 md:gap-3 mb-8">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-200",
            "flex items-center gap-2 justify-center md:justify-start",
            activeTab === tab.id
              ? "bg-gradient-to-r from-celo-green to-celo-gold text-black shadow-lg"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
