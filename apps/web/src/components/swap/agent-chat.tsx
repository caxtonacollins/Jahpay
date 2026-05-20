"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { useChainId } from "wagmi";
import { cn } from "@/lib/utils";
import type { SwapTokenSymbol } from "@/lib/swap/usdc-usdt-swap";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }>;
}

interface AgentChatProps {
  fromToken?: SwapTokenSymbol;
  toToken?: SwapTokenSymbol;
  amount?: string;
  onPrepareSwap?: (payload: {
    amount: string;
    fromToken: SwapTokenSymbol;
    toToken: SwapTokenSymbol;
    slippageBps?: number;
  }) => void;
  className?: string;
}

const STARTER_PROMPTS = [
  "What's the rate for 100 USDC?",
  "Quote 500 USDT to USDC",
  "Recommend slippage for 5000 USDC",
  "Is USDC/USDT tradable right now?",
];

export function AgentChat({
  fromToken = "USDC",
  toToken = "USDT",
  amount = "",
  onPrepareSwap,
  className,
}: AgentChatProps) {
  const chainId = useChainId();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content:
        "Ask me for live Mento rates, swap quotes, slippage advice, or DEX alternatives on Celo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            chainId,
            fromToken,
            toToken,
            amount: amount || undefined,
          }),
        });

        if (!res.ok) throw new Error("Chat request failed");
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "agent",
            content: data.message,
            suggestedActions: data.suggestedActions,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "agent",
            content: "Sorry, I couldn't reach the agent service. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, fromToken, toToken, amount, isLoading],
  );

  const handleAction = (action: string, payload?: Record<string, unknown>) => {
    if (action === "prepare_swap" && onPrepareSwap && payload) {
      onPrepareSwap({
        amount: String(payload.amount ?? amount),
        fromToken: (payload.fromToken as SwapTokenSymbol) ?? fromToken,
        toToken: (payload.toToken as SwapTokenSymbol) ?? toToken,
        slippageBps: payload.slippageBps as number | undefined,
      });
      return;
    }
    if (action === "rate" || action === "quote") {
      const amt = String(payload?.amount ?? "100");
      const from = (payload?.fromToken as SwapTokenSymbol) ?? fromToken;
      const to = (payload?.toToken as SwapTokenSymbol) ?? toToken;
      sendMessage(`What's the rate for ${amt} ${from} to ${to}?`);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        ref={scrollRef}
        className="flex-1 min-h-[180px] max-h-[240px] overflow-y-auto space-y-3 px-1 py-2 scrollbar-thin"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "agent" && (
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-purple-400" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-brand-blue/20 text-white border border-brand-blue/30"
                  : "bg-white/[0.04] text-white/75 border border-white/[0.06]",
              )}
            >
              {msg.content.replace(/\*\*/g, "")}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestedActions.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(a.action, a.payload)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/40 px-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing live Mento data...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {STARTER_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={isLoading}
            className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-colors disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about rates, swaps, slippage..."
          disabled={isLoading}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-purple-500/40"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 rounded-xl bg-purple-500/80 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
