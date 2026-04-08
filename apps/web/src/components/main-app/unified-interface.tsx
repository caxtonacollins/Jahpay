"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TransactionTabs, TransactionType } from "./transaction-tabs";
import { SwapPanel } from "./panels/swap-panel";
import { OnrampPanel } from "./panels/onramp-panel";
import { OfframpPanel } from "./panels/offramp-panel";
import { TransactionSummary } from "./transaction-summary";

interface TransactionState {
  type: TransactionType;
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  txHash?: string;
}

export function UnifiedInterface() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-celo-green/10 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container relative z-10 max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-celo-green via-blue-400 to-celo-gold bg-clip-text text-transparent">
            jahpay
          </h1>
          <p className="text-white/60 text-lg">
            Seamless fiat-to-crypto and crypto-to-fiat conversions on Celo
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 md:p-8 shadow-2xl">
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-400 font-medium">
                      {transactionState.message}
                    </p>
                    {transactionState.txHash && (
                      <p className="text-green-400/70 text-sm mt-1 font-mono break-all">
                        {transactionState.txHash}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {transactionState.status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">
                      Transaction failed
                    </p>
                    <p className="text-red-400/70 text-sm mt-1">
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
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

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          {[
            { title: "Fast", description: "Instant conversions" },
            { title: "Secure", description: "Smart contract verified" },
            { title: "Multi-Provider", description: "Best rates guaranteed" },
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-4 text-center">
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.description}</p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
