// Contract addresses (update these with your deployed contract addresses)
export const RAMP_CONTRACT_ADDRESS = '0x...'; // Replace with your deployed contract address

// Default chain configuration
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

// Testnet configuration
export const ALFAJORES_CHAIN = {
  id: 44787,
  name: 'Celo Alfajores',
  network: 'alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: 'https://alfajores-forno.celo-testnet.org',
  },
  blockExplorers: {
    default: { name: 'Alfajores Explorer', url: 'https://alfajores.celoscan.io' },
  },
  testnet: true,
};

// Supported tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: 'CELO',
    name: 'Celo Native',
    decimals: 18,
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438', // Celo mainnet
    logo: '/tokens/celo.png',
  },
  {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    decimals: 18,
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // Celo mainnet
    logo: '/tokens/cusd.png',
  },
  {
    symbol: 'cEUR',
    name: 'Celo Euro',
    decimals: 18,
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', // Celo mainnet
    logo: '/tokens/ceur.png',
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
