"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SwapPanel } from "../main-app/panels/swap-panel";
import { AIAgentPanel } from "./ai-agent-panel";
import type { AgentRecommendation } from "@/lib/agent/erc8004-agent";

type SwapStatus = "idle" | "loading" | "success" | "error";

interface SwapState {
  status: SwapStatus;
  message?: string;
  txHash?: string;
}

export function SwapInterface() {
  const [mounted, setMounted] = useState(false);
  const [swapState, setSwapState] = useState<SwapState>({ status: "idle" });
  const [agentRec, setAgentRec] = useState<AgentRecommendation | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = useCallback(
    () => setSwapState({ status: "loading" }),
    [],
  );

  const handleSuccess = useCallback((txHash?: string) => {
    setSwapState({
      status: "success",
      txHash,
      message: "Swap completed successfully!",
    });
    setTimeout(() => setSwapState({ status: "idle" }), 6000);
  }, []);

  const handleError = useCallback((error: string) => {
    setSwapState({ status: "error", message: error });
    setTimeout(() => setSwapState({ status: "idle" }), 8000);
  }, []);

  if (!mounted) {
    return (
      <div className="relative z-10 w-full max-w-[420px] mx-auto space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <GlassCard className="p-5 md:p-6" glow hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white">
                  Swap Stablecoins
                </h2>
                {/* <p className="text-xs text-white/40 mt-0.5">
                  Powered by Mento Protocol
                </p> */}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand-green/10 border border-brand-green/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[11px] font-medium text-brand-green">
                  Live
                </span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-white/40">
              Loading...
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-[420px] mx-auto space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <GlassCard className="p-5 md:p-6" glow hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">
                Swap Stablecoins
              </h2>
              {/* <p className="text-xs text-white/40 mt-0.5">
                Powered by Mento Protocol
              </p> */}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand-green/10 border border-brand-green/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[11px] font-medium text-brand-green">
                Live
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {swapState.status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="rounded-xl bg-brand-green/[0.08] border border-brand-green/25 flex items-start gap-3 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-green">
                    {swapState.message}
                  </p>
                  {swapState.txHash && (
                    <a
                      href={`https://celoscan.io/tx/${swapState.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-green/60 hover:text-brand-green mt-0.5 font-mono transition-colors"
                    >
                      <span className="truncate">
                        {swapState.txHash.slice(0, 20)}...
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
            {swapState.status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="rounded-xl bg-red-500/[0.08] border border-red-500/25 flex items-start gap-3 px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Swap failed
                  </p>
                  <p className="text-xs text-red-400/60 mt-0.5">
                    {swapState.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SwapPanel
            onTransactionStart={handleStart}
            onTransactionSuccess={handleSuccess}
            onTransactionError={handleError}
            isLoading={swapState.status === "loading"}
            onRecommendation={setAgentRec}
          />

          <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-white/[0.05]">
            {[
              {
                icon: <Shield className="w-3.5 h-3.5 text-brand-green" />,
                text: "Non-Custodial",
              },
              {
                icon: <Zap className="w-3.5 h-3.5 text-brand-blue" />,
                text: "Oracle-Priced",
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-xs text-white/35"
              >
                {icon}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <AIAgentPanel recommendation={agentRec} />
    </div>
  );
}
