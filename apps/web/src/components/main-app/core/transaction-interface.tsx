"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { TransactionTabs, TransactionType } from "../transaction-tabs";
import { SwapPanel } from "../panels/swap-panel";
import { OnrampPanel } from "../panels/onramp-panel";
import { OfframpPanel } from "../panels/offramp-panel";
import { TransactionSummary } from "../transaction-summary";

interface TransactionState {
  type: TransactionType;
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  txHash?: string;
}

const FEATURES = [
  {
    icon: <Zap className="w-4 h-4 text-brand-blue" />,
    title: "Instant",
    description: "Real-time conversions",
  },
  {
    icon: <Shield className="w-4 h-4 text-brand-green" />,
    title: "Secure",
    description: "Contract verified",
  },
  {
    icon: <Globe className="w-4 h-4 text-blue-400" />,
    title: "Multi-Provider",
    description: "Best rates guaranteed",
  },
];

export function TransactionInterface() {
  const [activeTab, setActiveTab] = useState<TransactionType>("swap");
  const [transactionState, setTransactionState] = useState<TransactionState>({
    type: "swap",
    status: "idle",
  });

  const handleTabChange = useCallback((tab: TransactionType) => {
    setActiveTab(tab);
    setTransactionState({ type: tab, status: "idle" });
  }, []);

  const handleTransactionStart = useCallback(() => {
    setTransactionState((prev) => ({ ...prev, status: "loading" }));
  }, []);

  const handleTransactionSuccess = useCallback((txHash?: string) => {
    setTransactionState((prev) => ({
      ...prev,
      status: "success",
      txHash,
      message: "Transaction completed successfully!",
    }));
  }, []);

  const handleTransactionError = useCallback((error: string) => {
    setTransactionState((prev) => ({
      ...prev,
      status: "error",
      message: error,
    }));
  }, []);

  const resetTransaction = useCallback(() => {
    setTransactionState({ type: activeTab, status: "idle" });
  }, [activeTab]);

  return (
    <div className="relative z-10 w-full max-w-lg mx-auto">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
      >
        <GlassCard className="p-5 md:p-6" glow hover={false}>
            {/* Transaction Tabs */}
            <TransactionTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {transactionState.status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-xl bg-brand-green/[0.08] border border-brand-green/25 flex items-start gap-3 px-4 py-3 overflow-hidden"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-green">
                      {transactionState.message}
                    </p>
                    {transactionState.txHash && (
                      <p className="text-xs text-brand-green/60 mt-0.5 font-mono truncate">
                        {transactionState.txHash}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {transactionState.status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-xl bg-red-500/[0.08] border border-red-500/25 flex items-start gap-3 px-4 py-3 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">
                      Transaction failed
                    </p>
                    <p className="text-xs text-red-400/60 mt-0.5">
                      {transactionState.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Panels */}
            <AnimatePresence mode="wait">
              {activeTab === "swap" && (
                <motion.div
                  key="swap"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <SwapPanel
                    onTransactionStart={handleTransactionStart}
                    onTransactionSuccess={handleTransactionSuccess}
                    onTransactionError={handleTransactionError}
                    isLoading={transactionState.status === "loading"}
                  />
                </motion.div>
              )}

              {activeTab === "onramp" && (
                <motion.div
                  key="onramp"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <OnrampPanel
                    onTransactionStart={handleTransactionStart}
                    onTransactionSuccess={handleTransactionSuccess}
                    onTransactionError={handleTransactionError}
                    isLoading={transactionState.status === "loading"}
                  />
                </motion.div>
              )}

              {activeTab === "offramp" && (
                <motion.div
                  key="offramp"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <OfframpPanel
                    onTransactionStart={handleTransactionStart}
                    onTransactionSuccess={handleTransactionSuccess}
                    onTransactionError={handleTransactionError}
                    isLoading={transactionState.status === "loading"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Summary */}
            {transactionState.status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 pt-5 border-t border-white/[0.06]"
              >
                <TransactionSummary
                  type={activeTab}
                  status={transactionState.status}
                  onReset={resetTransaction}
                />
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {FEATURES.map((item, idx) => (
            <GlassCard key={idx} className="p-3.5 text-center" hover>
              <div className="flex justify-center mb-2">{item.icon}</div>
              <h3 className="text-xs font-semibold text-white mb-0.5">
                {item.title}
              </h3>
              <p className="text-[11px] text-white/40 leading-snug">
                {item.description}
              </p>
            </GlassCard>
          ))}
      </motion.div>
    </div>
  );
}
