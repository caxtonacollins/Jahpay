"use client";
import Link from "next/link";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Zap,
  Shield,
  Bot,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Lock,
  Star,
  ExternalLink,
} from "lucide-react";

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 28 },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "< 5s", label: "Settlement Time" },
  // { value: "0.3%", label: "Platform Fee" },
  { value: "Oracle", label: "Pricing Source" },
  { value: "ERC-8004", label: "AI Standard" },
];

const FEATURES = [
  {
    icon: <RefreshCw className="w-5 h-5 text-brand-blue" />,
    title: "Mento & Uniswap Pricing",
    desc: "Swap USDC and USDT at oracle-sourced rates from Mento and Uniswap — no AMM slippage, no price manipulation.",
    gradient: "from-brand-blue/20 to-blue-600/5",
    border: "border-brand-blue/15",
  },
  {
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    title: "ERC-8004 AI Agent",
    desc: "An on-chain registered AI agent monitors conditions and recommends optimal slippage in real time.",
    gradient: "from-purple-500/20 to-violet-600/5",
    border: "border-purple-500/15",
  },
  {
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    title: "Fee Abstraction",
    desc: "Pay gas in USDC or USDT. No CELO needed. Celo's native fee abstraction handles the rest.",
    gradient: "from-yellow-500/20 to-amber-600/5",
    border: "border-yellow-500/15",
  },
  {
    icon: <Shield className="w-5 h-5 text-brand-green" />,
    title: "Non-Custodial",
    desc: "Your keys, your tokens. Swaps execute directly from your wallet — we never hold your funds.",
    gradient: "from-brand-green/20 to-emerald-600/5",
    border: "border-brand-green/15",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    title: "Circuit Breaker Protection",
    desc: "Mento's circuit breaker auto-pauses trading during extreme volatility — your swap is always safe.",
    gradient: "from-cyan-500/20 to-blue-600/5",
    border: "border-cyan-500/15",
  },
  {
    icon: <Lock className="w-5 h-5 text-rose-400" />,
    title: "Transparent Fees",
    desc: "0.3% platform fee shown before every swap. No hidden charges. No surprise deductions.",
    gradient: "from-rose-500/20 to-pink-600/5",
    border: "border-rose-500/15",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Link any Celo-compatible wallet — Metamask, Valora, or any WalletConnect app.",
  },
  {
    num: "02",
    title: "Enter Amount",
    desc: "Type how much USDC or USDT you want to swap. A live oracle quote appears instantly.",
  },
  {
    num: "03",
    title: "AI Reviews",
    desc: "The ERC-8004 agent assesses market conditions and recommends the safest slippage setting.",
  },
  {
    num: "04",
    title: "Confirm & Swap",
    desc: "Review the fee breakdown and confirm. Your swap settles on Celo in under 5 seconds.",
  },
];

const FAQS = [
  {
    q: "What tokens can I swap?",
    a: "Jahpay supports USDC ↔ USDT on Celo Mainnet. Both are native, audited stablecoins — not bridged versions.",
  },
  {
    q: "How does the AI agent work?",
    a: "The ERC-8004 agent is registered on-chain as an ERC-721 NFT on Celo. It monitors Mento oracle rates and recommends optimal slippage before each swap. After completion, it records feedback on-chain to build its reputation.",
  },
  {
    q: "What is the platform fee?",
    a: "0.3% on every swap, deducted from the output amount. It is always shown transparently before you confirm.",
  },
  {
    q: "Do I need CELO for gas?",
    a: "No. Celo's fee abstraction lets you pay gas in USDC or USDT directly.",
  },
  {
    q: "Is this safe?",
    a: "Swaps are executed through Mento Protocol v3 — a battle-tested, audited DEX native to Celo. Jahpay never holds your funds.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all p-5 group"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-white/50 mt-3 leading-relaxed"
        >
          {a}
        </motion.p>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="flex-1 overflow-x-hidden jahpay-bg jahpay-grid relative">
      {/* ── Animated Overlay Gradients ────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_70%)]"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(139,92,246,0.1),transparent_70%)]"
        />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              <motion.div variants={fadeUp}>
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                    Smart swaps for
                  </span>
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-green">
                      USDC, USDT & CELO
                    </span>
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-green"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    />
                  </span>
                  <br />
                  <span className="text-white/80 text-4xl md:text-5xl xl:text-6xl font-semibold">
                    built for Celo.
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="text-lg text-slate-400 leading-relaxed max-w-xl"
              >
                Oracle-aware routing, transparent pricing, and an on-chain AI
                agent that recommends safer execution settings before every
                swap.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold text-base hover:opacity-90 hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(39,117,202,0.3)] hover:shadow-[0_0_40px_rgba(39,117,202,0.5)] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">Go to App <ArrowRight className="w-4 h-4" /></span>
                </Link>
                <a
                  href="https://docs.celo.org/build-on-celo/build-with-ai/8004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.1] text-white/70 hover:text-white hover:border-white/20 font-medium text-base transition-all"
                >
                  ERC-8004 Docs <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.05]"
              >
                {STATS.map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-green to-cyan-400">
                      {value}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 150 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/15 to-purple-500/15 rounded-3xl blur-3xl -z-10" />
              <div className="rounded-3xl border border-white/[0.12] bg-[#0b1222]/85 backdrop-blur-xl p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Jahpay App
                    </p>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Dedicated swap experience
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/15 border border-brand-green/30 text-xs font-semibold text-brand-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {[
                    {
                      title: "Execution guidance",
                      value: "ERC-8004 AI Agent",
                    },
                    {
                      title: "Settlement",
                      value: "Celo Mainnet",
                    },
                  ].map(({ title, value }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-white/35">
                        {title}
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-brand-blue/20 bg-brand-blue/[0.08] p-4">
                  <p className="text-xs uppercase tracking-wider text-brand-blue/80">
                    Sample quote preview
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <p className="text-white text-lg font-bold">100 USDC</p>
                      <p className="text-white/45 text-xs">You send</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/35 mb-1" />
                    <div className="text-right">
                      <p className="text-brand-green text-lg font-bold">
                        ~99.70 USDT
                      </p>
                      <p className="text-white/45 text-xs">You receive</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/app"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green px-5 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                >
                  Go to App
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/25 bg-brand-blue/8 text-xs font-semibold text-brand-blue uppercase tracking-wider mb-4">
              Why Jahpay
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Built different.
            </h2>
            <p className="text-lg text-slate-400 mt-4 max-w-xl mx-auto">
              Every design decision prioritises security, transparency, and
              intelligence.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map(({ icon, title, desc, gradient, border }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`group relative rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/30`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32">
        <div className="container px-4 mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-green/25 bg-brand-green/8 text-xs font-semibold text-brand-green uppercase tracking-wider mb-4">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Swap in 4 steps.
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-blue/40 via-brand-green/30 to-transparent -translate-x-px hidden md:block" />

            <div className="space-y-10">
              {STEPS.map(({ num, title, desc }, idx) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-6 md:gap-10 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="flex-1 md:text-right">
                    {idx % 2 !== 0 && (
                      <div className="hidden md:block">
                        <div className="text-sm font-bold text-white mb-1">
                          {title}
                        </div>
                        <p className="text-sm text-white/45 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    )}
                    {idx % 2 === 0 && <div />}
                  </div>

                  {/* Step badge */}
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-brand-blue/25 z-10">
                    {num}
                  </div>

                  <div className="flex-1">
                    {idx % 2 === 0 && (
                      <div>
                        <div className="text-sm font-bold text-white mb-1">
                          {title}
                        </div>
                        <p className="text-sm text-white/45 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    )}
                    {idx % 2 !== 0 && (
                      <div className="md:hidden">
                        <div className="text-sm font-bold text-white mb-1">
                          {title}
                        </div>
                        <p className="text-sm text-white/45 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Agent Spotlight ────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.08),transparent_70%)]" />
        <div className="container px-4 mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Agent card mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-brand-blue/10 rounded-3xl blur-2xl -z-10" />
              <div className="rounded-3xl border border-purple-500/20 bg-[#0a0f1e]/90 backdrop-blur-md p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-purple-500/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-green border-2 border-[#0a0f1e]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Jahpay Swap Agent
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                      Optimal conditions · ERC-8004
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-sm text-white/55 leading-relaxed p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  &quot;Oracle rates are stable. Ultra-low slippage (0.1%) is
                  safe for this amount.&quot;
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Slippage", value: "0.1%" },
                    { label: "Confidence", value: "97%" },
                    { label: "Protocol", value: "Mento v3" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                    >
                      <div className="text-xs text-white/35 mb-1">{label}</div>
                      <div className="text-sm font-bold text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/25">
                  <span>On-chain identity · Celo Mainnet</span>
                  <span>ERC-721 · Registered</span>
                </div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-block px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/8 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                AI Agent
              </span>
              <h2 className="text-4xl font-bold text-white leading-tight">
                An AI that earns trust{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-brand-blue">
                  on-chain.
                </span>
              </h2>
              <p className="text-white/50 leading-relaxed">
                The Jahpay Swap Agent is registered on Celo Mainnet as an
                ERC-8004 identity — an ERC-721 NFT with a public reputation.
                Every swap it assists with is recorded on-chain, building a
                verifiable track record that anyone can audit.
              </p>
              <ul className="space-y-3">
                {[
                  "Recommends slippage based on live oracle conditions",
                  "Detects Mento circuit breaker status before you swap",
                  "Builds on-chain reputation with every transaction",
                  "Discoverable by other agents via ERC-8004 Identity Registry",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-green/15 border border-brand-green/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://docs.celo.org/build-on-celo/build-with-ai/8004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Learn about ERC-8004 <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32">
        <div className="container px-4 mx-auto max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-white">Frequently asked.</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="container px-4 mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to swap?
            </h2>
            <p className="text-lg text-slate-400">
              Connect your wallet and let the AI agent guide your first swap.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="app"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold hover:opacity-90 hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(39,117,202,0.3)] hover:shadow-[0_0_40px_rgba(39,117,202,0.5)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">Launch Swap <ArrowRight className="w-4 h-4" /></span>
              </a>
              <a
                href="https://celoscan.io/token/0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 font-medium transition-all"
              >
                View on CeloScan <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
