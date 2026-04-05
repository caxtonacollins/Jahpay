// Contract addresses (update these with your deployed contract addresses)
export const RAMP_CONTRACT_ADDRESS = '0x...'; // Replace with your deployed contract address

// Default chain configuration - MiniPay mainnet
export const DEFAULT_CHAIN = {
  id: 42220,
  name: 'Celo Mainnet',
  network: 'celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: 'https://forno.celo.org',
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://celoscan.io' },
  },
  testnet: false,
};

// Testnet configuration - MiniPay uses Celo Sepolia (not Alfajores)
export const CELO_SEPOLIA_CHAIN = {
  id: 11142220,
  name: 'Celo Sepolia',
  network: 'celo-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: 'https://forno.celo-sepolia.celo-testnet.org',
  },
  blockExplorers: {
    default: { name: 'Celo Sepolia Explorer', url: 'https://celo-sepolia.blockscout.com' },
  },
  testnet: true,
};

// MiniPay supported stablecoins only
export const SUPPORTED_TOKENS = [
  {
    symbol: 'USDm',
    name: 'Celo Dollar',
    decimals: 18,
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // Celo mainnet
    addressSepolia: '0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9', // Celo Sepolia
    logo: '/tokens/cusd.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', // Celo mainnet
    addressSepolia: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7', // Celo Sepolia
    logo: '/tokens/usdc.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', // Celo mainnet
    addressSepolia: '0x617f3112bf5ad0E84e882D5142D04ae6C606cc89', // Celo Sepolia
    logo: '/tokens/usdt.png',
  },
];

// Supported fiat currencies
export const SUPPORTED_FIAT_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

// Transaction statuses
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  ON_RAMP: 'on-ramp',
  OFF_RAMP: 'off-ramp',
} as const;

// KYC statuses
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

// Default transaction limits (in USD)
export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 10, // $10
  MAX_AMOUNT: {
    unverified: 1000, // $1,000
    verified: 10000, // $10,000
  },
  DAILY_LIMIT: {
    unverified: 5000, // $5,000
    verified: 50000, // $50,000
  },
};

// Default fees (in basis points - 1% = 100 bps)
export const DEFAULT_FEES = {
  PLATFORM_FEE_BPS: 50, // 0.5%
  PROVIDER_FEE_RANGE: {
    min: 100, // 1%
    max: 300, // 3%
  },
};

// MiniPay specific configuration
export const MINIPAY_CONFIG = {
  // Only USDm (cUSD) is supported for feeCurrency in MiniPay
  SUPPORTED_FEE_CURRENCY: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDm mainnet
  SUPPORTED_FEE_CURRENCY_SEPOLIA: '0x10c892A6EC43a53E45D0B916B4b7D383B1b4f9f9', // USDm Sepolia
  // MiniPay only accepts legacy transactions (no EIP-1559)
  USE_LEGACY_TRANSACTIONS: true,
  // Recommended for MiniPay apps
  MOBILE_FIRST: true,
};
