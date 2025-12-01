export const SiteConfig = {
  name: 'jahpay DApp',
  description:
    'Seamlessly convert between fiat and crypto with the best rates from multiple providers',
  url: 'https://jahpay.vercel.app',
  ogImage: 'https://jahpay.vercel.app/og.jpg',
  links: {
    twitter: 'https://twitter.com/jahpayapp',
    github: 'https://github.com/yourusername/jahpay',
  },
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Buy',
      href: '/buy',
    },
    {
      title: 'Sell',
      href: '/sell',
    },
    {
      title: 'History',
      href: '/history',
    },
  ],
} as const;

export const CURRENCIES = {
  NGN: {
    name: 'Nigerian Naira',
    symbol: '₦',
    code: 'NGN',
    flag: '🇳🇬',
  },
  USD: {
    name: 'US Dollar',
    symbol: '$',
    code: 'USD',
    flag: '🇺🇸',
  },
  EUR: {
    name: 'Euro',
    symbol: '€',
    code: 'EUR',
    flag: '🇪🇺',
  },
  GBP: {
    name: 'British Pound',
    symbol: '£',
    code: 'GBP',
    flag: '🇬🇧',
  },
} as const;

export const CRYPTOS = {
  CELO: {
    name: 'Celo',
    symbol: 'CELO',
    icon: '/tokens/celo.png',
    decimals: 18,
  },
  cUSD: {
    name: 'Celo Dollar',
    symbol: 'cUSD',
    icon: '/tokens/cusd.png',
    decimals: 18,
  },
  cEUR: {
    name: 'Celo Euro',
    symbol: 'cEUR',
    icon: '/tokens/ceur.png',
    decimals: 18,
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '/tokens/usdc.png',
    decimals: 6,
  },
} as const;

export const PROVIDERS = {
  YELLOW_CARD: {
    id: 'yellowcard',
    name: 'Yellow Card',
    logo: '/providers/yellowcard.png',
    description: 'Fast and reliable fiat on/off ramp',
    countries: ['NG', 'GH', 'KE', 'ZA', 'RW', 'UG', 'TZ', 'ZM', 'CM', 'SN'],
    fees: {
      buy: '1.5%',
      sell: '1.5%',
    },
    minAmount: 1000, // NGN
    maxAmount: 5000000, // NGN
  },
  CASHRAMP: {
    id: 'cashramp',
    name: 'Cashramp',
    logo: '/providers/cashramp.png',
    description: 'Bank transfers with competitive rates',
    countries: ['NG', 'GH', 'KE', 'UG'],
    fees: {
      buy: '2%',
      sell: '2%',
    },
    minAmount: 5000, // NGN
    maxAmount: 2000000, // NGN
  },
  BITMAMA: {
    id: 'bitmama',
    name: 'Bitmama',
    logo: '/providers/bitmama.png',
    description: 'Mobile money and bank transfers',
    countries: ['NG', 'GH'],
    fees: {
      buy: '2.5%',
      sell: '2.5%',
    },
    minAmount: 1000, // NGN
    maxAmount: 1000000, // NGN
  },
} as const;
