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
  MessageSquare,
} from "lucide-react";
import { getAgentReputation } from "@/lib/agent/erc8004-agent";
import type { AgentRecommendation } from "@/lib/agent/erc8004-agent";
import type { AgentReputation } from "@/lib/agent/erc8004-agent";
import { AgentChat } from "./agent-chat";
import { cn } from "@/lib/utils";
import { ThirdwebProvider, useFetchWithPayment } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import type { SwapTokenSymbol } from "@/lib/swap/usdc-usdt-swap";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const thirdwebClient = clientId
  ? createThirdwebClient({ clientId })
  : null;

interface AIAgentPanelProps {
  recommendation: AgentRecommendation | null;
  fromToken?: SwapTokenSymbol;
  toToken?: SwapTokenSymbol;
  onPrepareSwap?: (payload: {
    amount: string;
    fromToken: SwapTokenSymbol;
    toToken: SwapTokenSymbol;
    slippageBps?: number;
  }) => void;
  className?: string;
}

const CONDITION_CONFIG = {
  optimal: { color: "text-brand-green", dot: "bg-brand-green", label: "Optimal" },
  normal: { color: "text-blue-400", dot: "bg-blue-400", label: "Normal" },
  volatile: { color: "text-yellow-400", dot: "bg-yellow-400", label: "Volatile" },
};

function PremiumAnalysisBlock() {
  const { fetchWithPayment, isPending } = useFetchWithPayment(thirdwebClient!);
  const [premiumData, setPremiumData] = useState<Record<string, unknown> | null>(null);
  const [premiumError, setPremiumError] = useState<string | null>(null);

  const handlePremiumRequest = async () => {
    setPremiumError(null);
    try {
      const res = (await fetchWithPayment("/api/agent/premium-analysis")) as Response;
      const json = await res.json();
      if (json.data) setPremiumData(json.data);
      else setPremiumError("Failed to fetch premium analysis");
    } catch {
      setPremiumError("Payment cancelled or failed");
    }
  };

  if (!premiumData) {
    return (
      <div className="flex flex-col items-center text-center gap-2">
        <Lock className="w-4 h-4 text-purple-400" />
        <p className="text-[10px] text-white/50">
          Live Mento market analysis (x402 micropayment)
        </p>
        {premiumError && <p className="text-xs text-red-400">{premiumError}</p>}
        <button
          onClick={handlePremiumRequest}
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Unlock ($0.05)"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs text-white/70">
      <p>
        Sentiment:{" "}
        <span className="text-brand-green capitalize">
          {String(premiumData.overallSentiment)}
        </span>
      </p>
      {(premiumData.macroTrends as string[] | undefined)?.map((t, i) => (
        <p key={i} className="text-white/50">
          • {t}
        </p>
      ))}
    </div>
  );
}

function AIAgentPanelInner({
  recommendation,
  fromToken = "USDC",
  toToken = "USDT",
  onPrepareSwap,
  className,
}: AIAgentPanelProps) {
  const [reputation, setReputation] = useState<AgentReputation | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");

  useEffect(() => {
    getAgentReputation().then(setReputation).catch(() => {});
  }, []);

  const condition = recommendation?.marketCondition ?? "optimal";
  const cfg = CONDITION_CONFIG[condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "rounded-3xl border border-white/[0.08] bg-[#080d18]/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-white/[0.15] hover:shadow-[0_10px_40px_rgba(168,85,247,0.15)] mt-4",
        className,
      )}
    >
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
            <span className="text-sm font-bold text-white tracking-wide">Jahpay AI Agent</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)]">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            <span className={cn("text-[11px] font-medium", cfg.color)}>
              {cfg.label} ·
            </span>
            {reputation?.averageScore != null && (
              <span className="ml-1 text-[10px] text-white/30 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-yellow-400/60 text-yellow-400/60" />
                {reputation.averageScore}/100
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-white/30 shrink-0 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="flex border-b border-white/[0.05]">
              {(
                [
                  { id: "chat" as const, label: "Chat", icon: MessageSquare },
                  { id: "insights" as const, label: "Insights", icon: TrendingUp },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                    activeTab === id
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-white/40 hover:text-white/60",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4 pt-3">
              {activeTab === "chat" ? (
                <AgentChat
                  fromToken={fromToken}
                  toToken={toToken}
                  onPrepareSwap={onPrepareSwap}
                />
              ) : (
                <div className="space-y-4">
                  {recommendation?.message && (
                    <p className="text-xs text-white/60 leading-relaxed">
                      {recommendation.message}
                    </p>
                  )}

                  {recommendation && (
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
                          <span className="text-xs font-semibold text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    {thirdwebClient ? (
                      <PremiumAnalysisBlock />
                    ) : (
                      <p className="text-[10px] text-white/40 text-center">
                        Set NEXT_PUBLIC_THIRDWEB_CLIENT_ID for premium x402 analysis.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AIAgentPanel(props: AIAgentPanelProps) {
  if (!thirdwebClient) {
    return <AIAgentPanelInner {...props} />;
  }
  return (
    <ThirdwebProvider>
      <AIAgentPanelInner {...props} />
    </ThirdwebProvider>
  );
}
