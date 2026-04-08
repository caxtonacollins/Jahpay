# Main App Screen - Unified Transaction Interface

A professional, single-page interface for seamless fiat-to-crypto and crypto-to-fiat conversions on the Celo blockchain.

## Features

### 🎯 Three Transaction Types in One Page
- **Swap**: Exchange crypto tokens directly
- **Buy Crypto (Onramp)**: Convert fiat to crypto
- **Sell Crypto (Offramp)**: Convert crypto to fiat

### 🎨 Professional Design
- Glassmorphic UI with frosted glass effects
- Smooth animations using Framer Motion
- Responsive design (mobile-first)
- Dark theme with Celo green/gold gradients
- Real-time status updates

### ⚡ Key Components

#### `unified-interface.tsx`
Main container component that manages:
- Tab switching between transaction types
- Transaction state management (idle, loading, success, error)
- Status message display
- Animated background effects

#### `transaction-tabs.tsx`
Tab navigation with:
- Icon-based tab selection
- Active state animations
- Responsive layout (icons only on mobile, full labels on desktop)

#### Transaction Panels
- **`swap-panel.tsx`**: Token-to-token swaps with rate display
- **`onramp-panel.tsx`**: Fiat-to-crypto purchases
- **`offramp-panel.tsx`**: Crypto-to-fiat sales

#### Input Components
- **`token-input.tsx`**: Crypto token selection and amount input
- **`fiat-input.tsx`**: Fiat currency selection and amount input

#### Supporting Components
- **`rate-info.tsx`**: Exchange rate and fee display
- **`provider-selector.tsx`**: Payment provider selection (Yellow Card, Cashramp, Bitmama)
- **`transaction-summary.tsx`**: Transaction status and action buttons

## Usage

```tsx
import { UnifiedInterface } from '@/components/main-app/unified-interface';

export default function AppPage() {
  return <UnifiedInterface />;
}
```

## Styling

The component uses:
- **Tailwind CSS** for utility styling
- **Framer Motion** for animations
- **Glassmorphic design** with backdrop blur effects
- **CSS variables** for theming (HSL color system)

### Color Scheme
- Primary: Celo Green (`#1FBF74`)
- Accent: Celo Gold (`#FFD700`)
- Background: Slate 950 (`#030712`)
- Text: White with opacity variations

## State Management

The unified interface manages:
- Active transaction type (swap/onramp/offramp)
- Transaction status (idle/loading/success/error)
- Error messages and transaction hashes

## Integration Points

### Required Props for Panels
Each panel accepts:
- `onTransactionStart()`: Called when transaction begins
- `onTransactionSuccess(txHash?)`: Called on successful completion
- `onTransactionError(error)`: Called on failure
- `isLoading`: Boolean to disable buttons during processing

### API Integration
Replace the mock API calls in each panel with actual:
- Swap aggregator API
- Onramp provider APIs (Yellow Card, Cashramp, Bitmama)
- Offramp provider APIs
- Rate calculation endpoints

## Responsive Behavior

- **Mobile**: Single column, icon-only tabs, full-width inputs
- **Tablet**: Two column layout, full tab labels
- **Desktop**: Optimized spacing, hover effects

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast text on dark backgrounds
- Loading states with spinner animations

## Future Enhancements

- [ ] Real-time rate updates via WebSocket
- [ ] Transaction history integration
- [ ] KYC verification flow
- [ ] Multi-wallet support
- [ ] Transaction limits display
- [ ] Fee breakdown details
- [ ] Slippage tolerance settings
- [ ] Advanced swap options (limit orders, etc.)
