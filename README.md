<div align="center">
  <img src="apps/web/public/images/logo_name.png" alt="jahpay" width="200" />
  
  
  **Seamless fiat-to-crypto conversion on Celo**
  
  [![Celo](https://img.shields.io/badge/Built%20on-Celo-gold?style=flat-square)](https://celo.org)
  [![MiniPay](https://img.shields.io/badge/MiniPay-Compatible-blue?style=flat-square)](https://docs.minipay.xyz)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
</div>

Jahpay is a modern Web3 application that enables seamless fiat-to-crypto and crypto-to-fiat conversions on the Celo blockchain. Built with Next.js and TypeScript, it works as both a standard website and a MiniPay Mini App, supporting stablecoin transactions with multiple payment providers.

## Features

- **Dual-Mode Operation**: Works as a website and MiniPay Mini App
- **Multi-Provider Support**: Yellow Card, Cashramp, Bitmama
- **Stablecoin Transactions**: USDm, USDC, USDT support
- **Smart Contracts**: RampAggregator for optimized on/off-ramp flows
- **Mobile-First Design**: Responsive UI optimized for mobile
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
│   ├── web/              # Next.js frontend application
│   └── contracts/        # Solidity smart contracts
├── packages/             # Shared utilities and types
└── docs/                 # Documentation
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm type-check` | Run TypeScript type checking |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Web3** | Wagmi, Viem, RainbowKit |
| **Blockchain** | Celo, Solidity |
| **Monorepo** | Turborepo, PNPM |

## Blockchain Integration

- **Network**: Celo Mainnet (42220) & Celo Sepolia (11142220)
- **Tokens**: USDm, USDC, USDT
- **Smart Contracts**: RampAggregator for optimized routing
- **Wallet Support**: MetaMask, WalletConnect, MiniPay

## MiniPay Support

jahpay is fully compatible with MiniPay, the fastest-growing stablecoin wallet in the Global South. The app automatically detects the MiniPay environment and adapts accordingly.

**Learn more**: [MiniPay Integration Guide](MINIPAY_INTEGRATION.md)

## Documentation

- [MiniPay Integration](MINIPAY_INTEGRATION.md) - Full MiniPay setup guide
- [Quick Start](QUICK_START_MINIPAY.md) - 5-minute setup
- [Architecture](ARCHITECTURE.md) - System design
- [Testing Checklist](MINIPAY_TESTING_CHECKLIST.md) - Testing procedures

## Security

- Smart contracts audited for security
- No private keys stored in the app
- Secure wallet integration via industry-standard libraries
- Environment variables for sensitive configuration

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
