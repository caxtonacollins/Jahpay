# jahpay Architecture - Dual-Mode Web3 App

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     jahpay Application                          │
│                    (Next.js 14 + React 18)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Root Layout (layout.tsx)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MiniPayProvider (Context)                   │  │
│  │  - Detects window.ethereum.isMiniPay                    │  │
│  │  - Retrieves user address                               │  │
│  │  - Provides context to entire app                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           WalletProvider (Wagmi + RainbowKit)           │  │
│  │  - Configures Wagmi with Celo chains                    │  │
│  │  - Sets up RainbowKit for wallet connection             │  │
│  │  - Handles SSR hydration                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Navbar Component                      │  │
│  │  - Uses useMiniPay() hook                                │  │
│  │  - Conditionally hides Connect button                   │  │
│  │  - Shows button only in website mode                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Page Components                        │  │
│  │  - Can use useMiniPay() hook                             │  │
│  │  - Can use minipay-utils for transactions               │  │
│  │  - Render different UI based on mode                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Website Mode
```
User Browser
    ↓
[Visit http://localhost:3000]
    ↓
[App loads]
    ↓
[MiniPayProvider detects: isMiniPay = false]
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
[App can use Wagmi hooks for transactions]
    ↓
[User can interact with all features]
```

### MiniPay Mode
```
MiniPay App
    ↓
[User opens Mini App]
    ↓
[App loads in MiniPay WebView]
    ↓
[MiniPayProvider detects: isMiniPay = true]
    ↓
[MiniPayProvider retrieves user address]
    ↓
[Navbar hides "Connect Wallet" button]
    ↓
[App uses injected window.ethereum]
    ↓
[User can interact with stablecoin features]
    ↓
[Transactions use legacy format]
    ↓
[Fees paid in USDm]
```

## Component Hierarchy

```
RootLayout
├── MiniPayProvider
│   ├── isMiniPay: boolean
│   ├── isLoading: boolean
│   └── userAddress: string | null
│
├── WalletProvider
│   ├── WagmiProvider
│   ├── QueryClientProvider
│   └── RainbowKitProvider
│
├── Navbar
│   ├── useMiniPay() hook
│   ├── Conditional Connect Button
│   └── Mobile Menu
│
├── Main Content
│   ├── Pages
│   │   ├── Home
│   │   ├── Buy
│   │   ├── Sell
│   │   └── History
│   │
│   └── Components
│       ├── MiniPayAwareComponent
│       ├── MiniPayOnlyComponent
│       └── WebsiteOnlyComponent
│
└── Footer
```

## State Management

### MiniPay Context
```typescript
interface MiniPayContextType {
  isMiniPay: boolean;      // Is app running in MiniPay?
  isLoading: boolean;      // Still detecting?
  userAddress: string | null; // User's wallet address
}
```

### Wagmi State (Website Mode)
```typescript
// From useAccount hook
{
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  status: 'connected' | 'disconnected' | 'reconnecting';
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
