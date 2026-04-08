# Main App Screen - Implementation Guide

## Overview

The new main app screen (`/app`) provides a unified, professional interface for all transaction types on jahpay:
- **Swap**: Crypto-to-crypto exchanges
- **Buy Crypto**: Fiat-to-crypto conversions (onramp)
- **Sell Crypto**: Crypto-to-fiat conversions (offramp)

## Architecture

```
src/components/main-app/
├── unified-interface.tsx          # Main container & state management
├── transaction-tabs.tsx           # Tab navigation component
├── transaction-summary.tsx        # Status display & actions
├── rate-info.tsx                  # Exchange rate & fee info
├── provider-selector.tsx          # Payment provider selection
├── panels/
│   ├── swap-panel.tsx            # Token swap interface
│   ├── onramp-panel.tsx          # Buy crypto interface
│   └── offramp-panel.tsx         # Sell crypto interface
├── inputs/
│   ├── token-input.tsx           # Crypto token input
│   └── fiat-input.tsx            # Fiat currency input
└── README.md                      # Component documentation

src/app/
└── app/
    └── page.tsx                   # Main app page route
```

## Key Features

### 1. Tab-Based Navigation
- Three transaction types accessible via tabs
- Smooth animations between tabs
- Icon-based on mobile, full labels on desktop
- Active state with gradient highlight

### 2. Transaction Panels
Each panel handles its specific flow:

**Swap Panel**
- From/To token selection
- Amount input with balance display
- Swap button with token reversal
- Real-time rate calculation

**Onramp Panel**
- Fiat currency selection
- Crypto token selection
- Provider selection (Yellow Card, Cashramp, Bitmama)
- Fee breakdown

**Offramp Panel**
- Crypto token selection with balance
- Fiat currency selection
- Provider selection
- Fee breakdown

### 3. Status Management
- **Idle**: Ready for input
- **Loading**: Transaction processing
- **Success**: Completion with tx hash
- **Error**: Failure with error message

### 4. Design System
- **Colors**: Celo green (#1FBF74) & gold (#FFD700)
- **Effects**: Glassmorphic cards with backdrop blur
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Clean, readable hierarchy

## Integration Checklist

### Before Going Live

- [ ] Connect to real swap aggregator API
- [ ] Integrate Yellow Card API
- [ ] Integrate Cashramp API
- [ ] Integrate Bitmama API
- [ ] Add real-time rate updates
- [ ] Implement wallet connection check
- [ ] Add transaction history tracking
- [ ] Set up error logging
- [ ] Add KYC verification flow
- [ ] Implement transaction limits
- [ ] Add slippage tolerance settings
- [ ] Test on mobile devices
- [ ] Performance optimization
- [ ] Security audit

### API Integration Points

**Swap Panel** (`swap-panel.tsx`)
```typescript
// Replace mock API call with:
const response = await fetch('/api/swap', {
  method: 'POST',
  body: JSON.stringify({
    fromToken,
    toToken,
    amount: fromAmount,
    slippage: 0.5,
  }),
});
```

**Onramp Panel** (`onramp-panel.tsx`)
```typescript
// Replace mock API call with:
const response = await fetch('/api/onramp', {
  method: 'POST',
  body: JSON.stringify({
    fiatCurrency,
    fiatAmount,
    cryptoToken,
    provider: selectedProvider,
  }),
});
```

**Offramp Panel** (`offramp-panel.tsx`)
```typescript
// Replace mock API call with:
const response = await fetch('/api/offramp', {
  method: 'POST',
  body: JSON.stringify({
    cryptoToken,
    cryptoAmount,
    fiatCurrency,
    provider: selectedProvider,
  }),
});
```

## Styling Customization

### Colors
Edit Tailwind config in `tailwind.config.js`:
```javascript
extend: {
  colors: {
    'celo-green': '#1FBF74',
    'celo-gold': '#FFD700',
  }
}
```

### Animations
Framer Motion animations can be adjusted in each component:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>
```

## Performance Optimization

1. **Code Splitting**: Each panel is lazy-loaded
2. **Memoization**: Use `useCallback` for event handlers
3. **Animation Performance**: GPU-accelerated transforms
4. **Bundle Size**: Tree-shaking unused components

## Testing

### Unit Tests
```bash
npm run test -- src/components/main-app
```

### E2E Tests
- Test tab switching
- Test form validation
- Test transaction flow
- Test error handling

### Manual Testing
1. Test on mobile (375px width)
2. Test on tablet (768px width)
3. Test on desktop (1920px width)
4. Test keyboard navigation
5. Test with slow network (DevTools throttling)

## Deployment

1. Ensure all API endpoints are configured
2. Run type checking: `npm run type-check`
3. Run linting: `npm run lint`
4. Build: `npm run build`
5. Test production build locally: `npm run start`
6. Deploy to staging for QA
7. Deploy to production

## Troubleshooting

### Tab switching not working
- Check `TransactionType` type definition
- Verify `onTabChange` callback is passed correctly

### Animations stuttering
- Check GPU acceleration in DevTools
- Reduce animation complexity
- Profile with React DevTools Profiler

### API calls failing
- Check CORS headers
- Verify API endpoints in `.env`
- Check network tab in DevTools

### Mobile layout broken
- Verify Tailwind responsive classes
- Test with actual mobile device
- Check viewport meta tag in layout

## Future Enhancements

1. **Advanced Swap Options**
   - Limit orders
   - Recurring swaps
   - Slippage tolerance UI

2. **Enhanced UX**
   - Transaction history
   - Favorites/recent tokens
   - Price alerts
   - Portfolio tracking

3. **Additional Features**
   - Multi-chain support
   - Bridge integration
   - Staking interface
   - Lending/borrowing

## Support

For issues or questions:
1. Check component README.md
2. Review inline code comments
3. Check git commit history for context
4. Open an issue on GitHub

---

**Branch**: `feat/main-app-screen`
**Route**: `/app`
**Status**: Ready for integration
