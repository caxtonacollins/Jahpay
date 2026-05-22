# 🚀 START HERE - Jahpay USDC ↔ USDT Swap Platform

Welcome to Jahpay! A modern Web3 application for oracle-priced USDC ↔ USDT swaps on Celo and an ERC-8004 AI agent.

## 📋 What You Need to Know

### ✅ What Jahpay Does

- **Oracle-Priced Swaps**: USDC ↔ USDT at Mento Protocol rates—no AMM slippage
- **ERC-8004 AI Agent**: On-chain registered agent recommends optimal slippage in real time
- **Fee Abstraction**: Pay gas in USDC or USDT—no CELO needed
- **Non-Custodial**: Your keys, your tokens—swaps execute directly from your wallet
- **Circuit Breaker Protection**: Mento's auto-pause during extreme volatility
- **Transparent Fees**: 0.3% platform fee shown before every swap
- **Dual-Mode**: Works as a website and MiniPay Mini App

### 🎯 How It Works

```
Website Mode              MiniPay Mode
    ↓                         ↓
Connect Wallet    →   Auto-connected
Multi-wallet      →   Stablecoins only
USDC ↔ USDT       →   USDC ↔ USDT
```

## 🚀 Quick Start (5 minutes)

### Step 1: Setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values
```

### Step 2: Start Development Server

```bash
pnpm dev
# Visit http://localhost:3000
```

### Step 3: Test Swap Interface

```bash
# Click "Connect Wallet"
# Select your wallet (MetaMask, WalletConnect, etc.)
# Enter swap amount
# See AI recommendation
# Confirm swap
```

## 📚 Documentation Guide

**Start with one of these based on your need:**

| Need                    | Document                       | Time   |
| ----------------------- | ------------------------------ | ------ |
| Get started quickly     | `QUICK_START.md`               | 5 min  |
| Understand architecture | `ARCHITECTURE.md`              | 15 min |
| MiniPay integration     | `MINIPAY_INTEGRATION.md`       | 10 min |
| Test thoroughly         | `MINIPAY_TESTING_CHECKLIST.md` | 20 min |
| See all features        | `README.md`                    | 10 min |

## 💻 Code Examples

### Get Swap Quote

```typescript
import { getSwapQuote } from "@/lib/swap/usdc-usdt-swap";

const quote = await getSwapQuote(
  "USDC", // fromToken
  "USDT", // toToken
  "100", // amountIn
  42220, // chainId
  50, // slippageBps (0.5%)
);

console.log(quote.amountOutNet); // Amount user receives
console.log(quote.platformFee); // 0.3% fee
```

### Build Swap Transaction

```typescript
import { buildSwapTransaction } from "@/lib/swap/usdc-usdt-swap";

const tx = await buildSwapTransaction(quote, userAddress, 42220);

// tx.approval - Approval transaction (if needed)
// tx.swap - Swap transaction
```

### Get AI Recommendation

```typescript
import { getSwapRecommendation } from "@/lib/agent/erc8004-agent";

const recommendation = await getSwapRecommendation(quote);

console.log(recommendation.recommendedSlippageBps); // 50
console.log(recommendation.marketCondition); // 'optimal'
console.log(recommendation.confidence); // 85
```

## 📁 Project Structure

```
jahpay/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   │   ├── swap/       # Swap interface
│   │   │   │   └── layout/     # Layout components
│   │   │   ├── lib/
│   │   │   │   ├── swap/       # Mento swap utilities
│   │   │   │   ├── agent/      # ERC-8004 agent
│   │   │   │   └── minipay/    # MiniPay utilities
│   │   │   └── contexts/       # React contexts
│   │   └── public/             # Static assets
│   └── contracts/              # Solidity smart contracts
│       ├── src/
│       │   ├── RampAggregator.sol
│       │   └── FeeCollector.sol
│       └── test/               # Foundry tests
└── docs/                       # Documentation
```

## ✨ Key Features

✅ **Oracle-Priced Swaps** - Mento Protocol v3 integration
✅ **ERC-8004 AI Agent** - On-chain registered agent with reputation
✅ **Fee Abstraction** - Pay gas in stablecoins
✅ **Non-Custodial** - Your keys, your tokens
✅ **Circuit Breaker** - Mento's volatility protection
✅ **Transparent Fees** - 0.3% shown before swap
✅ **Dual-Mode** - Website + MiniPay support
✅ **Type-Safe** - Full TypeScript support

## 🔧 Available Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build production bundle
pnpm lint         # Lint code
pnpm type-check   # Run TypeScript type checking
```

## 🌐 Supported Networks

| Network      | Chain ID | Purpose    |
| ------------ | -------- | ---------- |
| Celo Mainnet | 42220    | Production |
| Celo Sepolia | 11142220 | Testing    |

## 💰 Supported Tokens

| Token | Decimals | Issuer                   |
| ----- | -------- | ------------------------ |
| USDC  | 6        | Circle                   |
| USDT  | 6        | Tether                   |
| USDm  | 18       | Mento (internal routing) |

## 📞 Support

- **Celo Docs**: https://docs.celo.org/
- **Mento Protocol**: https://mento.org/
- **ERC-8004**: https://erc8004.org/
- **MiniPay Docs**: https://docs.minipay.xyz/

## 🎉 You're Ready!

Your app is fully configured. Start with `pnpm dev` and you'll be testing in 5 minutes!

---

**Questions?** Check the relevant documentation file above.

**Ready to start?** → `pnpm dev`
