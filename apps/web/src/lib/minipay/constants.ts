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

// ─── Swap Tokens (USDC ↔ USDT only) ─────────────────────────────────────────

export const SWAP_TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',      // Celo Mainnet
    addressSepolia: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7', // Celo Sepolia
    color: '#2775CA',
    logo: '/tokens/usdc.png',
    issuer: 'Circle',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e',      // Celo Mainnet
    addressSepolia: '0x617f3112bf5ad0E84e882D5142D04ae6C606cc89', // Celo Sepolia
    color: '#26A17B',
    logo: '/tokens/usdt.png',
    issuer: 'Tether',
  },
] as const;

// USDm still needed internally as Mento routing intermediate
export const USDM_TOKEN = {
  symbol: 'USDm',
  name: 'Mento USD',
  decimals: 18,
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  addressSepolia: '0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9',
};

// Keep SUPPORTED_TOKENS for Mento SDK compatibility (includes USDm)
export const SUPPORTED_TOKENS = [
  { ...USDM_TOKEN, logo: '/tokens/usdm.png' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', addressSepolia: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7', logo: '/tokens/usdc.png' },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', addressSepolia: '0x617f3112bf5ad0E84e882D5142D04ae6C606cc89', logo: '/tokens/usdt.png' },
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

export const AGENT_CONFIG = {
  name: 'Jahpay Swap Agent',
  description: 'AI-powered USDC↔USDT swap optimizer on Celo',
  /** Set after first registration: NEXT_PUBLIC_AGENT_ID */
  agentId: process.env.NEXT_PUBLIC_AGENT_ID || null,
  manifestUrl: '/api/agent/manifest',
  chainId: 42220,
};

// ERC-8004 contract addresses on Celo Mainnet (from docs.celo.org)
export const ERC8004_CONTRACTS = {
  identityRegistry: '0x...',   // fill after checking live chain deployments
  reputationRegistry: '0x...',
  validationRegistry: '0x...',
};

// ─── MiniPay / Fee Abstraction ────────────────────────────────────────────────

export const MINIPAY_CONFIG = {
  SUPPORTED_FEE_CURRENCY: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDm mainnet
  SUPPORTED_FEE_CURRENCY_SEPOLIA: '0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9',
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

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
