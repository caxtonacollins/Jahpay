# 🚀 Jahpay MVP Roadmap

This document outlines the essential steps to move Jahpay from its current state to a functional Minimum Viable Product (MVP).

## 📊 Current Status

- **UI/UX**: Premium swap interface is complete
- **Architecture**: Dual-mode (MiniPay + Web) detection logic is in place
- **Smart Contracts**: FeeCollector.sol is production-ready
- **Functionality**: Swap is functional using real Mento Protocol SDK integration

---

## 🏗️ Phase 1: Core Functional Integration (COMPLETE)

**Goal**: Make the swap panel functional using real on-chain logic.

1. **Functional Swap**: ✅
   - Real Mento Protocol v3 integration
   - Oracle-priced quotes
   - Transaction building with approval handling
   - Platform fee calculation (0.3%)
   - Circuit breaker checks

## 🧪 Phase 2: Testing & Verification

**Goal**: Ensure reliability and safety of funds.

1. **End-to-End Testing**:
   - Conduct full test cycles on **Celo Sepolia** for swaps
   - Test with real testnet tokens
   - Verify transaction confirmations
2. **Security Review**:
   - Final check of Fee Collector permissions
   - Ensure rate-limiting on API routes to prevent resource abuse
3. **Balance Checks**:
   - Add insufficient balance detection
   - Improve error handling

## 🚀 Phase 3: Deployment

**Goal**: Go live.

1. **Contract Deployment**: Deploy FeeCollector to Celo Mainnet
2. **Production Secrets**: Configure Vercel environment variables for production
3. **MiniPay Submission**: Submit the final build to the MiniPay App Discovery system

---

### 💡 Recommendation for Immediate Next Step

Start with **Phase 2: Testing**. Test real swaps on Celo Sepolia testnet to verify the integration works end-to-end.
