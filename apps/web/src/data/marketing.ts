/**
 * Marketing content and dummy data
 * Centralized location for all static marketing copy
 */

import {
    RefreshCw,
    Bot,
    Zap,
    Shield,
    TrendingUp,
    Lock,
} from "lucide-react";

export const STATS = [
    { value: "< 5s", label: "Settlement Time" },
    { value: "0.3%", label: "Platform Fee" },
    { value: "Oracle", label: "Pricing Source" },
    { value: "ERC-8004", label: "AI Standard" },
] as const;

export const FEATURES = [
    {
        icon: RefreshCw,
        title: "Mento Oracle Pricing",
        desc: "Swap USDC and USDT at oracle-sourced rates — no AMM slippage, no price manipulation.",
        gradient: "from-brand-blue/20 to-blue-600/5",
        border: "border-brand-blue/15",
    },
    {
        icon: Bot,
        title: "ERC-8004 AI Agent",
        desc: "An on-chain registered AI agent monitors conditions and recommends optimal slippage in real time.",
        gradient: "from-purple-500/20 to-violet-600/5",
        border: "border-purple-500/15",
    },
    {
        icon: Zap,
        title: "Fee Abstraction",
        desc: "Pay gas in USDC or USDT. No CELO needed. Celo's native fee abstraction handles the rest.",
        gradient: "from-yellow-500/20 to-amber-600/5",
        border: "border-yellow-500/15",
    },
    {
        icon: Shield,
        title: "Non-Custodial",
        desc: "Your keys, your tokens. Swaps execute directly from your wallet — we never hold your funds.",
        gradient: "from-brand-green/20 to-emerald-600/5",
        border: "border-brand-green/15",
    },
    {
        icon: TrendingUp,
        title: "Circuit Breaker Protection",
        desc: "Mento's circuit breaker auto-pauses trading during extreme volatility — your swap is always safe.",
        gradient: "from-cyan-500/20 to-blue-600/5",
        border: "border-cyan-500/15",
    },
    {
        icon: Lock,
        title: "Transparent Fees",
        desc: "0.3% platform fee shown before every swap. No hidden charges. No surprise deductions.",
        gradient: "from-rose-500/20 to-pink-600/5",
        border: "border-rose-500/15",
    },
] as const;

export const STEPS = [
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
] as const;

export const FAQS = [
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
        q: "Is my swap secure?",
        a: "Yes. Jahpay is non-custodial — your keys, your tokens. Swaps execute directly from your wallet. We never hold your funds.",
    },
] as const;
