// ─── Celo Chain Configuration ────────────────────────────────────────────────

export const DEFAULT_CHAIN = {
  id: 42220,
  name: 'Celo Mainnet',
  network: 'celo',
  nativeCurrency: { decimals: 18, name: 'CELO', symbol: 'CELO' },
  rpcUrls: { default: 'https://forno.celo.org' },
  blockExplorers: { default: { name: 'CeloScan', url: 'https://celoscan.io' } },
  testnet: false,
};

export const CELO_SEPOLIA_CHAIN = {
  id: 11142220,
  name: 'Celo Sepolia',
  network: 'celo-sepolia',
  nativeCurrency: { decimals: 18, name: 'CELO', symbol: 'CELO' },
  rpcUrls: { default: 'https://forno.celo-sepolia.celo-testnet.org' },
  blockExplorers: { default: { name: 'Celo Sepolia Explorer', url: 'https://celo-sepolia.blockscout.com' } },
  testnet: true,
};

// ─── Swap Tokens (USDC ↔ USDT ↔ CELO) ──────────────────────────────────────

export const SWAP_TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',      // Celo Mainnet
    addressSepolia: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7', // Celo Sepolia
    color: '#2775CA',
    logo: '/usd-coin-usdc-logo.svg',
    issuer: 'Circle',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',      // Celo Mainnet
    addressSepolia: '0x617f3112bF5ad0E84E882D5142D0aE6C606cc89', // Celo Sepolia
    color: '#26A17B',
    logo: '/tether-usdt-logo.svg',
    issuer: 'Tether',
  },
  {
    symbol: 'CELO',
    name: 'Celo',
    decimals: 18,
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',      // Celo Mainnet
    addressSepolia: '0xF194AFDF50bAE0a21EF85469d1521810657a1b53', // Celo Sepolia
    color: '#FCFF52',
    logo: '/celo-logo.svg',
    issuer: 'Celo',
  },
] as const;

// USDm still needed internally as Mento routing intermediate
export const USDM_TOKEN = {
  symbol: 'USDm',
  name: 'Mento USD',
  decimals: 18,
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  addressSepolia: '0x10c892A6ec43a53E45d0B916b4b7D383B1b4F9f9',
};

// Keep SUPPORTED_TOKENS for Mento SDK compatibility (includes USDm + CELO for rate API)
export const SUPPORTED_TOKENS = [
  { ...USDM_TOKEN, logo: '/usd-coin-usdc-logo.svg' },
  {
    symbol: 'CELO',
    name: 'Celo',
    decimals: 18,
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    addressSepolia: '0xF194AFDF50bAE0a21EF85469d1521810657a1b53',
    logo: '/celo-logo.svg',
  },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', addressSepolia: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7', logo: '/usd-coin-usdc-logo.svg' },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', addressSepolia: '0x617f3112bF5ad0E84E882D5142D0aE6C606cc89', logo: '/tether-usdt-logo.svg' },
];

// ─── Platform Fee ────────────────────────────────────────────────────────────

/** 0.3% platform fee (30 basis points) */
export const PLATFORM_FEE_BPS = 30;
export const PLATFORM_FEE_PERCENT = 0.3;

/** Address that collects platform fees — set in .env */
export const FEE_COLLECTOR_ADDRESS =
  process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

// ─── ERC-8004 Agent ───────────────────────────────────────────────────────────

export const
  AGENT_CONFIG = {
    name: 'Jahpay Swap Agent',
    description: 'AI-powered USDC↔USDT↔CELO swap optimizer on Celo',
    /** Set after first registration: NEXT_PUBLIC_AGENT_ID */
    agentId: process.env.NEXT_PUBLIC_AGENT_ID || null,
    manifestUrl: '/api/agent/manifest',
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 42220),
  };

// ERC-8004 contract addresses on Celo Mainnet (from docs.celo.org)
export const ERC8004_CONTRACTS = {
  identityRegistry:
    process.env.NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY ||
    '0x0000000000000000000000000000000000000000',
  reputationRegistry:
    process.env.NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY ||
    '0x0000000000000000000000000000000000000000',
  validationRegistry:
    process.env.NEXT_PUBLIC_ERC8004_VALIDATION_REGISTRY ||
    '0x0000000000000000000000000000000000000000',
};

// ─── MiniPay / Fee Abstraction ────────────────────────────────────────────────

export const MINIPAY_CONFIG = {
  SUPPORTED_FEE_CURRENCY: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDm mainnet
  SUPPORTED_FEE_CURRENCY_SEPOLIA: '0x10c892A6ec43a53E45d0b916b4b7D383B1b4F9f9',
  USE_LEGACY_TRANSACTIONS: true,
  MOBILE_FIRST: true,
};

// ─── Transaction Config ───────────────────────────────────────────────────────

export const SWAP_CONFIG = {
  DEFAULT_SLIPPAGE_BPS: 50,   // 0.5%
  SLIPPAGE_OPTIONS: [10, 50, 100] as const, // 0.1%, 0.5%, 1%
  DEADLINE_MINUTES: 5,
  MIN_AMOUNT_USD: 1,
  MAX_AMOUNT_USD: 100_000,
  QUOTE_DEBOUNCE_MS: 500,
};

// ─── Uniswap V3 (for CELO ↔ USDC/USDT swaps) ────────────────────────────────

export const UNISWAP_V3_CONTRACTS = {
  /** SwapRouter02 on Celo Mainnet */
  SWAP_ROUTER: '0x5615CDAb10dc425a742d643d949a7F474C01abc4' as const,
  /** Quoter V2 on Celo Mainnet */
  QUOTER_V2: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8' as const,
};

/** Standard Uniswap V3 pool fee tier for major pairs (0.3%) */
export const UNISWAP_POOL_FEE = 3000;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
