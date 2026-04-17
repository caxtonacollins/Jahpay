# 🚀 Jahpay MVP Roadmap

This document outlines the essential steps to move Jahpay from its current high-fidelity UI/mock state to a functional Minimum Viable Product (MVP).

## 📊 Current Status
- **UI/UX**: Premium landing page and app shell are complete.
- **Architecture**: Dual-mode (MiniPay + Web) detection logic is in place.
- **Smart Contracts**: `RampAggregator.sol` is comprehensive and production-ready.
- **Functionality**: Currently relying on **UI placeholders and mock API responses** for Swap, Onramp, and Offramp panels.

---

## 🏗️ Phase 1: Core Functional Integration
**Goal**: Make the main app panels functional using real on-chain and utility logic.

1. **Functional Swap**:
   - Replace the simulation in `SwapPanel.tsx` with calls to `minipay-utils.ts`.
   - Implement real token exchange rates (using a price feed or aggregator API).
2. **On-Ramp Flow**:
   - Connect `OnrampPanel.tsx` to the `RampAggregator` contract.
   - Implement the `initiate` API to communicate with real ramp providers.
3. **Off-Ramp Flow**:
   - Update `OfframpPanel.tsx` to handle token approvals and contract calls to `initiateOffRamp`.
   - Implement backend tracking for off-ramp status.

## 🔌 Phase 2: Provider & API Readiness
**Goal**: Connect to real payment infrastructure.

1. **Provider Integration**:
   - Implement actual API clients for **Yellow Card**, **Cashramp**, and **Bitmama** in the backend.
   - Configure secrets (API keys) in environment variables.
2. **Webhook Handlers**:
   - Create `/api/webhooks/ramp` to listen for status updates from providers.
   - Update the contract/database when fiat payments are confirmed.
3. **Fee Configuration**:
   - Set up the `FeeCollector` address and configure `feeBps` on the `RampAggregator` contract.

## 📱 Phase 3: MiniPay & UX Refinement
**Goal**: Optimize for the primary target environment.

1. **MiniPay Optimization**:
   - Fine-tune `MiniPayProvider` to ensure seamless auto-connection.
   - Verify that all transactions use the `feeCurrency: USDm` (cUSD) for gas in MiniPay.
2. **Transaction History**:
   - Populate `TransactionList.tsx` with real data from the backend/subgraph instead of mocks.
   - Add "View on Explorer" links for all transactions.

## 🧪 Phase 4: Verification & Security
**Goal**: Ensure reliability and safety of funds.

1. **End-to-End Testing**:
   - Conduct full test cycles on **Celo Sepolia** for all three types (Swap, On-Ramp, Off-Ramp).
2. **Security Review**:
   - Final check of contract permissions (Backend Signer, Fee Collector).
   - Ensure rate-limiting on API routes to prevent resource abuse.

## 🚀 Phase 5: Deployment
**Goal**: Go live.

1. **Contract Deployment**: Deploy `RampAggregator` to Celo Mainnet.
2. **Production Secrets**: Configure Vercel environment variables for production.
3. **MiniPay Submission**: Submit the final build to the MiniPay App Discovery system.

---

### 💡 Recommendation for Immediate Next Step
Start with **Phase 1, Step 1 (Functional Swap)**. It's the most straightforward way to begin moving from "Mock" to "Real" by utilizing the existing `minipay-utils.ts` and connecting them to the UI.
