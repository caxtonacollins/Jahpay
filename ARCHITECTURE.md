# jahpay Architecture - Oracle-Priced Stablecoin Swaps with ERC-8004 AI Agent

## System Overview

Jahpay is a Web3 application for USDC ↔ USDT swaps on Celo, powered by Mento Protocol v3 and an ERC-8004 AI agent. It operates as both a standard website and a MiniPay Mini App.

```
┌─────────────────────────────────────────────────────────────────┐
│                     jahpay Application                          │
│                    (Next.js 14 + React 18)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Root Layout (layout.tsx)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WalletProvider (Wagmi + RainbowKit)         │  │
│  │  - Configures Wagmi with Celo chains                    │  │
│  │  - Sets up RainbowKit for wallet connection             │  │
│  │  - Handles SSR hydration                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           TransactionsProvider (Context)                │  │
│  │  - Manages swap transaction state                       │  │
│  │  - Tracks pending/completed transactions               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Navbar Component                      │  │
│  │  - Displays wallet connection status                    │  │
│  │  - Shows network indicator                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Page Components                        │  │
│  │  - Home page with swap widget                           │  │
│  │  - Features showcase                                    │  │
│  │  - AI agent spotlight                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Swap Transaction Flow

```
User enters swap amount
    ↓
[Quote fetched from Mento Protocol]
    ↓
[Circuit breaker status checked]
    ↓
[AI agent analyzes market conditions]
    ↓
[Slippage recommendation provided]
    ↓
[Platform fee (0.3%) calculated]
    ↓
[User confirms swap]
    ↓
[Approval transaction (if needed)]
    ↓
[Swap transaction executed]
    ↓
[Feedback submitted to agent reputation registry]
    ↓
[Success/error state displayed with tx hash]
```

### Website Mode

```
User Browser
    ↓
[Visit http://localhost:3000]
    ↓
[App loads]
    ↓
[Navbar shows "Connect Wallet" button]
    ↓
[User clicks "Connect Wallet"]
    ↓
[RainbowKit modal appears]
    ↓
[User selects wallet (MetaMask, WalletConnect, etc.)]
    ↓
[Wallet connects]
    ↓
[User can interact with swap interface]
```

### MiniPay Mode

```
MiniPay App
    ↓
[User opens Mini App]
    ↓
[App loads in MiniPay WebView]
    ↓
[Wallet auto-connected via window.ethereum]
    ↓
[Navbar hides "Connect Wallet" button]
    ↓
[User can interact with swap interface]
    ↓
[Transactions use MiniPay-compatible format]
```

## Component Hierarchy

```
RootLayout
├── WalletProvider
│   ├── Wagmi configuration
│   ├── RainbowKit setup
│   └── SSR hydration
├── TransactionsProvider
│   ├── Swap state management
│   └── Transaction tracking
├── Navbar
│   ├── Wallet connection button
│   └── Network indicator
├── Main Content
│   ├── Home Page (page.tsx)
│   │   ├── Hero section
│   │   ├── SwapInterface component
│   │   ├── Features showcase
│   │   ├── AI agent spotlight
│   │   └── FAQ section
│   └── SwapInterface
│       ├── SwapPanel
│       │   ├── Token input/output
│       │   ├── Quote display
│       │   ├── Slippage selector
│       │   └── Confirmation modal
│       └── AIAgentPanel
│           ├── Recommendation display
│           └── Reputation info
└── Footer
```

## Core Modules

### 1. Swap Logic (`lib/swap/usdc-usdt-swap.ts`)

**Key Functions:**

- `getSwapQuote(fromToken, toToken, amountIn, chainId, slippageBps)` - Fetches oracle-priced quote from Mento
- `buildSwapTransaction(quote, userAddress, chainId)` - Constructs approval + swap transactions
- `checkPairTradable(fromToken, toToken, chainId)` - Checks Mento circuit breaker status
- `applyFee(grossAmount, decimals)` - Calculates 0.3% platform fee deduction

**Features:**

- Mento Protocol v3 integration
- Direct USDC ↔ USDT swaps
- Fallback routing via USDm when direct pair unavailable
- Circuit breaker protection
- Transparent fee calculation

### 2. ERC-8004 AI Agent (`lib/agent/erc8004-agent.ts`)

**Key Functions:**

- `getSwapRecommendation(quote, marketData)` - AI-powered slippage recommendations
- `getAgentReputation()` - Queries on-chain agent reputation
- `submitSwapFeedback(swapResult)` - Records swap outcomes on-chain
- `registerAgent(deployerPrivateKey)` - One-time agent registration (server-side only)

**Features:**

- On-chain registered ERC-721 NFT identity
- Market condition analysis (optimal, normal, volatile)
- Confidence scoring (0-100)
- Verifiable on-chain reputation
- Fallback recommendations when API unavailable

### 3. Configuration (`lib/minipay/constants.ts`)

**Token Configuration:**

- USDC: 6 decimals, Circle-issued
- USDT: 6 decimals, Tether-issued
- USDm: 18 decimals, Mento (internal routing)

**Platform Settings:**

- Platform fee: 30 BPS (0.3%)
- Slippage options: 10, 50, 100 BPS
- Quote debounce: 500ms
- Swap deadline: 5 minutes

**Network Configuration:**

- Celo Mainnet (42220)
- Celo Sepolia (11142220)

## Smart Contracts

### RampAggregator.sol

- Manages on/off-ramp transactions
- Supports multiple providers (Yellow Card, Cashramp, Bitmama)
- Provider configuration and fee management
- Off-ramp request tracking
- Emergency withdrawal functions

### FeeCollector.sol

- Collects platform fees (0.3%)
- Manages authorized collectors
- Supports native CELO and ERC20 tokens
- Owner-controlled fee withdrawal
- Event logging for transparency

## Key Technologies

| Component              | Technology     | Purpose                           |
| ---------------------- | -------------- | --------------------------------- |
| Frontend Framework     | Next.js 14     | Server-side rendering, API routes |
| UI Library             | React 18       | Component-based UI                |
| Styling                | Tailwind CSS   | Utility-first CSS                 |
| Components             | shadcn/ui      | Pre-built accessible components   |
| Animations             | Framer Motion  | Smooth UI transitions             |
| Web3 Integration       | Wagmi          | React hooks for Ethereum          |
| Wallet Connection      | RainbowKit     | Multi-wallet UI                   |
| Blockchain Interaction | Viem           | TypeScript Ethereum client        |
| Swap Protocol          | Mento SDK v3   | Oracle-priced swaps               |
| AI Agent               | ChaosChain SDK | ERC-8004 agent integration        |
| State Management       | React Context  | Global state management           |
| Data Fetching          | React Query    | Server state management           |
| Type Safety            | TypeScript     | Static type checking              |
| Build Tool             | Turborepo      | Monorepo build orchestration      |
| Package Manager        | PNPM           | Fast, disk-space efficient        |

## Supported Networks

| Network      | Chain ID | Purpose    | RPC                                         |
| ------------ | -------- | ---------- | ------------------------------------------- |
| Celo Mainnet | 42220    | Production | https://forno.celo.org                      |
| Celo Sepolia | 11142220 | Testing    | https://forno.celo-sepolia.celo-testnet.org |

## Supported Tokens

| Token | Decimals | Issuer | Mainnet Address                            | Sepolia Address                            |
| ----- | -------- | ------ | ------------------------------------------ | ------------------------------------------ |
| USDC  | 6        | Circle | 0xcebA9300f2b948710d2653dD7B07f33A8B32118C | 0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7 |
| USDT  | 6        | Tether | 0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e | 0x617f3112bf5ad0E84e882D5142D04ae6C606cc89 |
| USDm  | 18       | Mento  | 0x765DE816845861e75A25fCA122bb6898B8B1282a | 0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9 |

## Security Considerations

1. **Non-Custodial Design**: Users control keys via wallet, Jahpay never holds funds
2. **Reentrancy Guards**: Smart contracts protected against reentrancy attacks
3. **Pausable Operations**: Contracts can be paused in emergency situations
4. **Circuit Breaker**: Mento's circuit breaker auto-pauses trading during volatility
5. **Fee Transparency**: 0.3% fee shown before every swap
6. **Environment Variables**: Sensitive config stored in .env files
7. **Type Safety**: Full TypeScript for compile-time error detection

## Environment Variables

```env
# Wallet Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Fee Collector
NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS=0x...

# ERC-8004 Agent
NEXT_PUBLIC_AGENT_ID=your_agent_id

# Network
NEXT_PUBLIC_CHAIN_ID=42220
```

## Performance Optimizations

1. **Quote Debouncing**: 500ms debounce on quote fetches
2. **Lazy Loading**: Components loaded on-demand
3. **Image Optimization**: Next.js Image component for token logos
4. **Code Splitting**: Automatic code splitting via Next.js
5. **Caching**: React Query for server state caching

## Future Enhancements

- Multi-token swap support
- Limit orders
- Swap history and analytics
- Advanced slippage settings
- Mobile app (React Native)
- Additional payment providers
  │
  ├── WalletProvider
  │ ├── WagmiProvider
  │ ├── QueryClientProvider
  │ └── RainbowKitProvider
  │
  ├── Navbar
  │ ├── useMiniPay() hook
  │ ├── Conditional Connect Button
  │ └── Mobile Menu
  │
  ├── Main Content
  │ ├── Pages
  │ │ ├── Home
  │ │ ├── Buy
  │ │ ├── Sell
  │ │ └── History
  │ │
  │ └── Components
  │ ├── MiniPayAwareComponent
  │ ├── MiniPayOnlyComponent
  │ └── WebsiteOnlyComponent
  │
  └── Footer

````

## State Management

### MiniPay Context
```typescript
interface MiniPayContextType {
  isMiniPay: boolean;      // Is app running in MiniPay?
  isLoading: boolean;      // Still detecting?
  userAddress: string | null; // User's wallet address
}
````

### Wagmi State (Website Mode)

```typescript
// From useAccount hook
{
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  status: "connected" | "disconnected" | "reconnecting";
}
```

## Transaction Flow

### Website Mode (Multi-wallet)

```
User Action
    ↓
[Component calls Wagmi hook]
    ↓
[Wagmi prepares transaction]
    ↓
[Sends to connected wallet]
    ↓
[Wallet signs transaction]
    ↓
[Transaction sent to Celo RPC]
    ↓
[Transaction confirmed]
    ↓
[Update UI]
```

### MiniPay Mode (Stablecoins only)

```
User Action
    ↓
[Component calls minipay-utils function]
    ↓
[Function prepares legacy transaction]
    ↓
[Sets feeCurrency to USDm]
    ↓
[Sends to window.ethereum]
    ↓
[MiniPay wallet signs]
    ↓
[Transaction sent to Celo RPC]
    ↓
[Transaction confirmed]
    ↓
[Update UI]
```

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout with MiniPayProvider
│   │   ├── page.tsx
│   │   ├── buy/
│   │   ├── sell/
│   │   └── history/
│   │
│   ├── components/
│   │   ├── wallet-provider.tsx     ← Wagmi + RainbowKit setup
│   │   ├── layout/
│   │   │   ├── navbar.tsx          ← MiniPay-aware navbar
│   │   │   ├── footer.tsx
│   │   │   └── container.tsx
│   │   ├── minipay-aware-component.tsx ← Example components
│   │   ├── connect-button.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── contexts/
│   │   └── minipay-context.tsx     ← MiniPay detection context
│   │
│   ├── hooks/
│   │   ├── useMiniPay.ts           ← MiniPay detection hook
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── constants.ts            ← Stablecoin addresses & config
│   │   ├── minipay-utils.ts        ← MiniPay transaction utilities
│   │   ├── utils.ts
│   │   └── ...
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── types/
│       └── ...
│
├── public/
│   ├── tokens/
│   │   ├── cusd.png
│   │   ├── usdc.png
│   │   └── usdt.png
│   └── ...
│
├── .env.minipay.example
├── MINIPAY_README.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Configuration

### Supported Chains

```
┌─────────────────────────────────────────┐
│         Celo Mainnet (42220)            │
│  - Production environment               │
│  - Real stablecoins                     │
│  - Real transactions                    │
│  - Supported by MiniPay                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Celo Sepolia (11142220)            │
│  - Testing environment                  │
│  - Testnet stablecoins                  │
│  - Free testnet tokens                  │
│  - Official MiniPay testnet             │
└─────────────────────────────────────────┘
```

### Supported Tokens

```
┌──────────────────────────────────────────────────────┐
│ USDm (Celo Dollar)                                   │
│ - Decimals: 18                                       │
│ - Mainnet: 0x765DE816845861e75A25fCA122bb6898B8B1282a │
│ - Sepolia: 0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9 │
│ - Fee currency (MiniPay)                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ USDC (USD Coin)                                      │
│ - Decimals: 6                                        │
│ - Mainnet: 0xcebA9300f2b948710d2653dD7B07f33A8B32118C │
│ - Sepolia: 0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ USDT (Tether USD)                                    │
│ - Decimals: 6                                        │
│ - Mainnet: 0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e │
│ - Sepolia: 0x617f3112bf5ad0E84e882D5142D04ae6C606cc89 │
└──────────────────────────────────────────────────────┘
```

## Environment Detection

```
┌─────────────────────────────────────────┐
│      Check window.ethereum              │
└─────────────────────────────────────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
[Exists]            [Doesn't exist]
    ↓                   ↓
Check isMiniPay     Website Mode
    ↓
┌─────────┴─────────┐
↓                   ↓
[true]          [false]
↓               ↓
MiniPay Mode    Website Mode
```

## Security Considerations

### Private Keys

- ✅ Never stored in app
- ✅ Managed by wallet (MetaMask, MiniPay)
- ✅ Never exposed in logs

### Sensitive Data

- ✅ No private keys in localStorage
- ✅ No seed phrases in state
- ✅ No sensitive data in URLs

### Transaction Security

- ✅ Legacy transactions only (no EIP-1559 complexity)
- ✅ User must approve each transaction
- ✅ Gas fees transparent
- ✅ Fee currency clearly shown

## Performance Optimization

### Code Splitting

- ✅ Next.js automatic code splitting
- ✅ RainbowKit lazy loaded
- ✅ Components lazy loaded

### Caching

- ✅ React Query 5-minute stale time
- ✅ Browser caching enabled
- ✅ Static assets cached

### Bundle Size

- ✅ Tree-shaking enabled
- ✅ Unused code removed
- ✅ Optimized dependencies

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│  - Source code                          │
│  - Version control                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Vercel Deployment               │
│  - Auto-deploy on push                  │
│  - Production build                     │
│  - CDN distribution                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Website (Normal Users)             │
│  - https://jahpay.vercel.app            │
│  - Full wallet connection UI            │
│  - Multi-wallet support                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    MiniPay App Discovery                │
│  - Submitted to MiniPay                 │
│  - Listed in app discovery              │
│  - Users can open in MiniPay            │
└─────────────────────────────────────────┘
```

## Testing Architecture

```
┌─────────────────────────────────────────┐
│      Local Development                  │
│  - pnpm dev                             │
│  - http://localhost:3000                │
│  - Website mode testing                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      ngrok Tunnel                       │
│  - ngrok http 3000                      │
│  - Public URL for MiniPay               │
│  - Real-time testing                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      MiniPay Developer Mode             │
│  - Load Test Page                       │
│  - Paste ngrok URL                      │
│  - Test MiniPay mode                    │
└─────────────────────────────────────────┘
```

---

This architecture enables jahpay to work seamlessly as both a normal website and a MiniPay Mini App with automatic environment detection and conditional UI rendering.
