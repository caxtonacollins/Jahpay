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
}> = [
  {
    id: "swap",
    label: "Swap",
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    id: "onramp",
    label: "Buy Crypto",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "offramp",
    label: "Sell Crypto",
    icon: <TrendingDown className="w-4 h-4" />,
  },
];

export function TransactionTabs({
  activeTab,
  onTabChange,
}: TransactionTabsProps) {
  return (
    <div className="relative flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
            "text-sm font-medium transition-colors duration-200 z-10",
            activeTab === tab.id
              ? "text-black"
              : "text-white/50 hover:text-white/80"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabBg"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-blue to-brand-green"
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
