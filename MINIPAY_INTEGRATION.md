# MiniPay Integration Guide

This document outlines how jahpay is configured to work as both a normal website and a MiniPay Mini App.

## Overview

Your app now supports dual-mode operation:
- **Normal Website**: Full RainbowKit wallet connection UI for desktop/web users
- **MiniPay Mini App**: Auto-detects MiniPay environment and hides wallet UI (wallet is implicit)

## Key Changes Made

### 1. **Wallet Provider Configuration** (`apps/web/src/components/wallet-provider.tsx`)
- Removed Alfajores testnet (MiniPay doesn't support it)
- Kept Celo Mainnet (42220) and Celo Sepolia (11142220)
- Celo Sepolia is the official MiniPay testnet

### 2. **Stablecoin-Only Support** (`apps/web/src/lib/constants.ts`)
- **Removed**: CELO native token, cEUR
- **Supported**: USDm (cUSD), USDC, USDT
- Added token addresses for both mainnet and Sepolia testnet
- MiniPay only supports stablecoins for transactions

### 3. **MiniPay Detection Context** (`apps/web/src/contexts/minipay-context.tsx`)
- Detects if app is running inside MiniPay
- Auto-retrieves user address when in MiniPay
- Provides context to entire app for conditional rendering

### 4. **Smart Navbar** (`apps/web/src/components/layout/navbar.tsx`)
- Conditionally hides "Connect Wallet" button when in MiniPay
- Button shows for normal website usage
- Uses `useMiniPay()` hook for detection

### 5. **MiniPay Utilities** (`apps/web/src/lib/minipay-utils.ts`)
- `getStablecoinBalance()` - Get balance of any supported stablecoin
- `estimateGasInStablecoin()` - Estimate gas fees in USDm
- `sendStablecoinTransfer()` - Send stablecoin transactions (legacy only)
- `checkTransactionStatus()` - Verify transaction success
- Handles both mainnet and Sepolia testnet

### 6. **MiniPay Hook** (`apps/web/src/hooks/useMiniPay.ts`)
- `useMiniPay()` - Get MiniPay detection state and user address
- `getMiniPayAddress()` - Standalone function to get address
- `isRunningInMiniPay()` - Check if in MiniPay environment

## How It Works

### Normal Website Mode
1. User visits your website in a browser
2. RainbowKit wallet connection UI is visible
3. User connects with MetaMask, WalletConnect, etc.
4. App works with full wallet selection

### MiniPay Mini App Mode
1. User opens your app inside MiniPay
2. `window.ethereum.isMiniPay` is detected
3. Wallet connection UI is automatically hidden
4. User's wallet is implicitly available
5. App uses injected provider for transactions

## Important MiniPay Constraints

### Supported Chains
- **Mainnet**: Celo (42220)
- **Testnet**: Celo Sepolia (11142220) - NOT Alfajores

### Supported Tokens
- USDm (cUSD) - `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- USDC - `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`
- USDT - `0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e`

### Transaction Limitations
- **Legacy transactions only** - No EIP-1559 support
- **Fee currency**: Currently only USDm is supported
- **No custom gas settings**: MiniPay handles gas automatically

## Usage Examples

### Detect MiniPay and Get Address
```typescript
import { useMiniPay } from '@/hooks/useMiniPay';

export function MyComponent() {
  const { isMiniPay, userAddress } = useMiniPay();

  if (isMiniPay) {
    return <div>Connected to MiniPay: {userAddress}</div>;
  }

  return <div>Using normal wallet connection</div>;
}
```

### Get Stablecoin Balance
```typescript
import { getStablecoinBalance } from '@/lib/minipay-utils';

const balance = await getStablecoinBalance(
  userAddress,
  'USDm', // or 'USDC', 'USDT'
  42220   // chainId
);
```

### Send Stablecoin Transfer
```typescript
import { sendStablecoinTransfer } from '@/lib/minipay-utils';

const txHash = await sendStablecoinTransfer(
  recipientAddress,
  '10.5',  // amount
  'USDm',  // token
  42220    // chainId
);
```

### Estimate Gas in Stablecoin
```typescript
import { estimateGasInStablecoin } from '@/lib/minipay-utils';

const gasEstimate = await estimateGasInStablecoin(
  {
    to: recipientAddress,
    data: '0x...',
  },
  42220 // chainId
);
```

## Testing in MiniPay

### Enable Developer Mode
1. Open MiniPay app on your phone
2. Go to Settings → About
3. Tap Version number repeatedly until confirmation appears
4. Go back to Settings → Developer Settings
5. Enable "Developer Mode"
6. Toggle "Use Testnet" to use Celo Sepolia

### Load Your App
1. In Developer Settings, tap "Load Test Page"
2. Enter your app URL
3. For local testing, use ngrok: `ngrok http 3000`
4. Copy the ngrok URL and paste it in MiniPay

### Test Locally with ngrok
```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Start ngrok tunnel
ngrok http 3000

# Copy the ngrok URL and use it in MiniPay Developer Settings
```

## Deployment Checklist

- [ ] Update contract addresses in `.env.local`
- [ ] Test on Celo Sepolia testnet first
- [ ] Verify stablecoin balances work
- [ ] Test transactions in MiniPay
- [ ] Verify normal website mode still works
- [ ] Deploy to production
- [ ] Submit app to MiniPay app discovery

## Submitting to MiniPay

1. Ensure your app is fully functional on Celo mainnet
2. Visit [MiniPay Developer Portal](https://docs.minipay.xyz/)
3. Submit your app for review
4. Follow MiniPay design standards
5. Ensure mobile-first responsive design

## Resources

- [MiniPay Documentation](https://docs.minipay.xyz/)
- [Celo Documentation](https://docs.celo.org/)
- [MiniPay Quickstart](https://docs.celo.org/build-on-celo/build-on-minipay/quickstart)
- [MiniPay Code Library](https://docs.celo.org/build/build-on-minipay/code-library)

## Troubleshooting

### App not detecting MiniPay
- Ensure you're testing in MiniPay app, not browser
- Check that `window.ethereum.isMiniPay` is true
- Verify Developer Mode is enabled

### Transactions failing
- Ensure you're using legacy transactions (no EIP-1559)
- Check that feeCurrency is set to USDm address
- Verify user has sufficient balance

### Balance showing as 0
- Confirm you're on correct chain (mainnet or Sepolia)
- Verify token address is correct
- Check user has received testnet tokens from faucet

## Support

For issues or questions:
1. Check MiniPay documentation
2. Review code examples in this repo
3. Test in MiniPay Developer Mode
4. Check browser console for errors
