export const SiteConfig = {
  name: 'jahpay DApp',
  description:
    'Oracle-priced USDC ↔ USDT swaps on Celo powered by Mento Protocol',
  url: 'https://jahpay.vercel.app',
  ogImage: 'https://jahpay.vercel.app/og.jpg',
  links: {
    twitter: 'https://twitter.com/jahpayapp',
    github: 'https://github.com/caxtonacollins/jahpay',
  },
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Swap',
      href: '/',
    },
  ],
} as const;

// Fiat currencies removed - swap-only version

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

// Providers removed - swap-only version
