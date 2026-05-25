<div align="center">
  <img src="apps/web/public/images/logo_name.png" alt="jahpay" width="200" />
  
  
  **Oracle-Priced USDC ↔ USDT Swaps on Celo**
  
  [![Celo](https://img.shields.io/badge/Built%20on-Celo-gold?style=flat-square)](https://celo.org)
  [![Mento](https://img.shields.io/badge/Powered%20by-Mento%20v3-blue?style=flat-square)](https://mento.org)
  [![ERC-8004](https://img.shields.io/badge/ERC--8004-AI%20Agent-purple?style=flat-square)](https://erc8004.org)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
</div>

Jahpay is a modern Web3 application enabling seamless Celo ↔ USDC ↔ USDT stablecoin swaps on the Celo blockchain. Built with Next.js and TypeScript, it operates as both a standard website and a MiniPay Mini App, featuring oracle-priced rates, an ERC-8004 AI agent for intelligent recommendations, and transparent 0.3% platform fees.

## Features

- **Oracle-Priced Swaps**: USDC ↔ USDT at Mento Protocol rates—no AMM slippage
- **ERC-8004 AI Agent**: On-chain registered agent recommends optimal slippage in real time
- **Fee Abstraction**: Pay gas in USDC or USDT—no CELO needed
- **Non-Custodial**: Your keys, your tokens—swaps execute directly from your wallet
- **Circuit Breaker Protection**: Mento's auto-pause during extreme volatility
- **Dual-Mode Operation**: Works as a website and MiniPay Mini App
- **Transparent Fees**: 0.3% platform fee shown before every swap
- **Type-Safe**: Full TypeScript support

## Quick Start

### Prerequisites

- Node.js 18+
- PNPM 8+

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp apps/web/.env.minipay.example apps/web/.env.local
# Edit .env.local with your values

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
jahpay/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   │   ├── swap/       # Swap interface & logic
│   │   │   │   ├── main-app/   # Main app panels
│   │   │   │   └── layout/     # Layout components
│   │   │   ├── lib/
│   │   │   │   ├── swap/       # Mento swap utilities
│   │   │   │   ├── agent/      # ERC-8004 agent integration
│   │   │   │   └── minipay/    # MiniPay utilities & constants
│   │   │   └── contexts/       # React contexts
│   │   └── public/             # Static assets
│   └── contracts/              # Solidity smart contracts
│       ├── src/
│       │   └── FeeCollector.sol      # Platform fee collection
│       └── test/               # Foundry tests
└── docs/                       # Documentation
```

## Available Commands

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Start development server     |
| `pnpm build`      | Build production bundle      |
| `pnpm lint`       | Lint code                    |
| `pnpm type-check` | Run TypeScript type checking |

## Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| **Frontend**   | Next.js 14, React 18, TypeScript |
| **Styling**    | Tailwind CSS, shadcn/ui          |
| **Web3**       | Wagmi, Viem, RainbowKit          |
| **Swap Logic** | Mento Protocol v3 SDK            |
| **AI Agent**   | ERC-8004 (ChaosChain SDK)        |
| **Blockchain** | Celo, Solidity 0.8.27            |
| **Monorepo**   | Turborepo, PNPM                  |

## Core Features Explained

### Oracle-Priced Swaps

- USDC ↔ USDT swaps powered by Mento Protocol v3
- Rates sourced from on-chain oracles—no AMM slippage
- Circuit breaker auto-pauses trading during extreme volatility
- Supports slippage tolerance: 0.1%, 0.5%, 1.0%

### ERC-8004 AI Agent

- Registered on-chain as an ERC-721 NFT identity
- Analyzes market conditions and recommends optimal slippage
- Builds verifiable on-chain reputation with each swap
- Provides confidence scores and market condition assessments

### Fee Abstraction

- Pay gas fees in USDC or USDT—no CELO needed
- Celo's native fee abstraction handles conversion
- 0.3% platform fee (30 basis points) deducted from output
- Transparent fee display before every swap

### Non-Custodial

- Your keys, your tokens
- Swaps execute directly from your wallet
- Jahpay never holds or controls your funds
- All transactions signed by your wallet

## Blockchain Integration

- **Networks**: Celo Mainnet (42220) & Celo Sepolia (11142220)
- **Tokens**: USDC, USDT (6 decimals), USDm (18 decimals, internal routing)
- **Smart Contracts**:
  - `RampAggregator.sol` - Manages on/off-ramp transactions
  - `FeeCollector.sol` - Collects and manages platform fees
- **Wallet Support**: MetaMask, Valora, WalletConnect, MiniPay

## MiniPay Support

jahpay is fully compatible with MiniPay, the fastest-growing stablecoin wallet in the Global South. The app automatically detects the MiniPay environment and adapts accordingly.

**Learn more**: [MiniPay Integration Guide](MINIPAY_INTEGRATION.md)

## Documentation

- [Architecture](ARCHITECTURE.md) - Complete system design
- [MiniPay Integration](MINIPAY_INTEGRATION.md) - MiniPay setup guide
- [Quick Start](QUICK_START_MINIPAY.md) - 5-minute setup
- [Testing Checklist](MINIPAY_TESTING_CHECKLIST.md) - Testing procedures

## Security

- Non-custodial design—no private keys stored
- Secure wallet integration via industry-standard libraries
- Smart contracts with reentrancy guards and pausable operations
- Environment variables for sensitive configuration
- Circuit breaker protection from Mento Protocol

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **Celo Docs**: [https://docs.celo.org](https://docs.celo.org)
- **MiniPay Docs**: [https://docs.minipay.xyz](https://docs.minipay.xyz)
- **Issues**: [GitHub Issues](https://github.com/yourusername/jahpay/issues)

---

<div align="center">
  Built with ❤️ for financial inclusion on Celo
</div>
