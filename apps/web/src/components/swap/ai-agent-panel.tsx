"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Zap,
  TrendingUp,
  Shield,
  ChevronDown,
  Star,
  Lock,
  Loader2,
} from "lucide-react";
import { getAgentReputation } from "@/lib/agent/erc8004-agent";
import type { AgentRecommendation, AgentReputation } from "@/types/agent";
import { cn } from "@/lib/utils";
import {
  ThirdwebProvider,
  useFetchWithPayment,
  ConnectButton,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";

const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "dummy_client_id",
});

interface AIAgentPanelProps {
  recommendation: AgentRecommendation | null;
  className?: string;
}

const CONDITION_CONFIG = {
  optimal: {
    color: "text-brand-green",
    dot: "bg-brand-green",
    label: "Optimal",
  },
  normal: { color: "text-blue-400", dot: "bg-blue-400", label: "Normal" },
  volatile: {
    color: "text-yellow-400",
    dot: "bg-yellow-400",
    label: "Volatile",
  },
};

export function AIAgentPanel(props: AIAgentPanelProps) {
  // Wrap with ThirdwebProvider so x402 hooks work
  return (
    <ThirdwebProvider>
      <AIAgentPanelInner {...props} />
    </ThirdwebProvider>
  );
}

function AIAgentPanelInner({ recommendation, className }: AIAgentPanelProps) {
  const [reputation, setReputation] = useState<AgentReputation | null>(null);
  const [expanded, setExpanded] = useState(false);

  // x402 Premium Analysis State
  const { fetchWithPayment, isPending } = useFetchWithPayment(thirdwebClient);
  const [premiumData, setPremiumData] = useState<any>(null);
  const [premiumError, setPremiumError] = useState<string | null>(null);

  useEffect(() => {
    getAgentReputation()
      .then(setReputation)
      .catch(() => {});
  }, []);

  const condition = recommendation?.marketCondition ?? "optimal";
  const cfg = CONDITION_CONFIG[condition];

  const handlePremiumRequest = async () => {
    setPremiumError(null);
    try {
      // Calls our x402-gated API endpoint. thirdweb SDK handles the 402 challenge,
      // prompts the wallet for signature, and retries with the X-PAYMENT header.
      const res = (await fetchWithPayment(
        "/api/agent/premium-analysis",
      )) as Response;
      const json = await res.json();
      if (json.data) {
        setPremiumData(json.data);
      } else {
        setPremiumError("Failed to fetch premium analysis");
      }
    } catch (err) {
      console.error("Premium analysis error:", err);
      setPremiumError("Payment cancelled or failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-[#080d18]/80 backdrop-blur-md overflow-hidden",
        className,
      )}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-green shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              Jahpay AI Agent
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
              ERC-8004
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            <span className={cn("text-[11px] font-medium", cfg.color)}>
              {cfg.label} conditions
            </span>
            {reputation?.averageScore && (
              <span className="ml-1 text-[10px] text-white/30 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-yellow-400/60 text-yellow-400/60" />
                {reputation.averageScore}/100
              </span>
            )}
          </div>
        </div>

        {recommendation?.message && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-white/30 shrink-0 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && recommendation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/[0.05] pt-3">
              {/* Basic AI message */}
              <p className="text-xs text-white/60 leading-relaxed">
                {recommendation.message}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    icon: <Zap className="w-3 h-3 text-brand-blue" />,
                    label: "Slippage",
                    value: `${recommendation.recommendedSlippageBps / 100}%`,
                  },
                  {
                    icon: <TrendingUp className="w-3 h-3 text-brand-green" />,
                    label: "Confidence",
                    value: `${recommendation.confidence}%`,
                  },
                  {
                    icon: <Shield className="w-3 h-3 text-purple-400" />,
                    label: "Protocol",
                    value: "Mento v3",
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    {icon}
                    <span className="text-[10px] text-white/35">{label}</span>
                    <span className="text-xs font-semibold text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Premium x402 Feature */}
              <div className="mt-4 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                {!premiumData ? (
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">
                        Deep Market Analysis
                      </h4>
                      <p className="text-[10px] text-white/50">
                        Get advanced volatility and pool health metrics paid
                        instantly via x402 micropayments.
                      </p>
                    </div>

                    {premiumError && (
                      <p className="text-xs text-red-400">{premiumError}</p>
                    )}

                    <button
                      onClick={handlePremiumRequest}
                      disabled={isPending}
                      className="mt-2 w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />{" "}
                          Processing $0.05...
                        </>
                      ) : (
                        "Unlock Analysis ($0.05)"
                      )}
                    </button>
                    <p className="text-[9px] text-white/30">
                      Powered by thirdweb x402 Agent Payments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-brand-green" /> Premium
                        Analysis Unlocked
                      </h4>
                      <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
                        x402 Paid
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-black/20 border border-white/5">
                        <span className="text-white/40 block mb-1">
                          Overall Sentiment
                        </span>
                        <span className="text-brand-green capitalize">
                          {premiumData.overallSentiment}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-black/20 border border-white/5">
                        <span className="text-white/40 block mb-1">
                          Pool Health
                        </span>
                        <span className="text-white capitalize">
                          {premiumData.usdcUsdtPoolHealth.liquidityDepth}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 space-y-1.5 pt-2 border-t border-white/10">
                      {premiumData.macroTrends.map(
                        (trend: string, i: number) => (
                          <p key={i} className="flex gap-2">
                            <span className="text-purple-400">•</span> {trend}
                          </p>
                        ),
                      )}
                    </div>
                    <p className="text-[9px] text-white/30 italic mt-2">
                      {premiumData.disclaimer}
                    </p>
                  </div>
                )}
              </div>

              {/* On-chain reputation */}
              {reputation?.isRegistered && (
                <div className="flex items-center justify-between text-[10px] text-white/25 pt-2">
                  <span>On-chain identity · Celo Mainnet</span>
                  <span className="text-white/20">
                    ERC-721 #{reputation.agentId?.slice(0, 6)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
