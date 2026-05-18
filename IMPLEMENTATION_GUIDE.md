# 🚀 JahPay Implementation Guide

Complete guide to implementing Transaction History and ERC-8004 Agent features.

## 📋 Table of Contents

1. [Transaction History Setup](#transaction-history-setup)
2. [ERC-8004 Agent Setup](#erc8004-agent-setup)
3. [Testing](#testing)
4. [Deployment](#deployment)

---

## Transaction History Setup

### Overview

Transaction history is persisted in two layers:

- **Local Storage**: Immediate persistence for offline support
- **Supabase**: Optional cloud database for multi-device sync

### Step 1: Set Up Supabase (Optional but Recommended)

#### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: jahpay-transactions
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"

#### 1.2 Create Transactions Table

In Supabase SQL Editor, run:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  from_token TEXT,
  to_token TEXT,
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  platform_fee NUMERIC,
  tx_hash TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_transactions_user_address ON transactions(user_address);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own transactions
CREATE POLICY "Users can read their own transactions"
  ON transactions FOR SELECT
  USING (user_address = current_user_id());

-- Create policy to allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_address = current_user_id());
```

#### 1.3 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 1.4 Update Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 2: Install Supabase Client

```bash
cd apps/web
pnpm add @supabase/supabase-js
```

### Step 3: Test Transaction Saving

1. Start dev server: `pnpm dev`
2. Connect wallet
3. Execute a swap
4. Check Supabase dashboard → transactions table
5. Verify transaction appears with correct data

---

## ERC-8004 Agent Setup

### Overview

The ERC-8004 Agent provides on-chain reputation for swap recommendations:

- **Registration**: One-time on-chain registration
- **Feedback**: Automatic submission after each swap
- **Reputation**: Queryable on-chain reputation score

### Step 1: Deploy ERC-8004 Contracts (If Not Already Deployed)

The ERC-8004 standard requires two contracts:

#### 1.1 Identity Registry Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityRegistry {
    mapping(uint256 => Agent) public agents;
    uint256 public agentCounter;

    struct Agent {
        address owner;
        string uri;
        uint256 createdAt;
    }

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string uri);

    function register(string memory uri) public returns (uint256) {
        uint256 agentId = agentCounter++;
        agents[agentId] = Agent(msg.sender, uri, block.timestamp);
        emit AgentRegistered(agentId, msg.sender, uri);
        return agentId;
    }

    function getAgent(uint256 agentId) public view returns (address owner, string memory uri, uint256 createdAt) {
        Agent memory agent = agents[agentId];
        return (agent.owner, agent.uri, agent.createdAt);
    }
}
```

#### 1.2 Reputation Registry Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReputationRegistry {
    mapping(uint256 => Reputation) public reputations;

    struct Reputation {
        uint256 totalScore;
        uint256 totalFeedback;
        uint256 successCount;
    }

    event FeedbackGiven(
        uint256 indexed agentId,
        uint256 score,
        string tag,
        bytes32 hash
    );

    function giveFeedback(
        uint256 agentId,
        uint256 score,
        uint256 weight,
        string memory tag,
        string memory comment,
        string memory endpoint,
        string memory feedbackUri,
        bytes32 hash
    ) public {
        Reputation storage rep = reputations[agentId];
        rep.totalScore += score * weight;
        rep.totalFeedback += weight;
        if (score >= 80) rep.successCount += weight;

        emit FeedbackGiven(agentId, score, tag, hash);
    }

    function getSummary(uint256 agentId) public view returns (uint256 averageScore, uint256 totalFeedback, uint256 successRate) {
        Reputation memory rep = reputations[agentId];
        uint256 avg = rep.totalFeedback > 0 ? rep.totalScore / rep.totalFeedback : 0;
        uint256 rate = rep.totalFeedback > 0 ? (rep.successCount * 100) / rep.totalFeedback : 0;
        return (avg, rep.totalFeedback, rate);
    }
}
```

#### 1.3 Deploy to Celo

```bash
# Using Foundry
forge create --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY \
  src/IdentityRegistry.sol:IdentityRegistry

forge create --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY \
  src/ReputationRegistry.sol:ReputationRegistry
```

### Step 2: Register Agent On-Chain

Create a registration script:

```typescript
// scripts/register-agent.ts
import { ERC8004Agent } from "@/lib/agent/erc8004-onchain";

async function registerAgent() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const agentUri = "ipfs://QmYourAgentMetadata"; // Upload metadata to IPFS first

  const result = await ERC8004Agent.registerAgent(privateKey, agentUri);

  if (result.success) {
    console.log("Agent registered successfully!");
    console.log("Save this Agent ID:", result.agentId);
  } else {
    console.error("Registration failed:", result.error);
  }
}

registerAgent();
```

Run:

```bash
npx ts-node scripts/register-agent.ts
```

### Step 3: Update Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_AGENT_ID=your_agent_id
NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY=0x...
NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY=0x...
```

### Step 4: Test Agent Feedback

1. Start dev server: `pnpm dev`
2. Connect wallet
3. Execute a swap
4. Check contract on Celoscan for feedback events
5. Verify reputation score increased

---

## Testing

### Test Transaction History

```bash
# 1. Start dev server
pnpm dev

# 2. Connect wallet to http://localhost:3000

# 3. Execute a swap
# - Enter amount
# - Confirm swap
# - Wait for confirmation

# 4. Check transaction appears in history
# - Refresh page
# - Verify transaction persists

# 5. Check Supabase (if configured)
# - Go to Supabase dashboard
# - Check transactions table
# - Verify data matches
```

### Test ERC-8004 Agent

```bash
# 1. Register agent (if not already done)
npx ts-node scripts/register-agent.ts

# 2. Update NEXT_PUBLIC_AGENT_ID in .env.local

# 3. Start dev server
pnpm dev

# 4. Execute a swap
# - Agent recommendation should appear
# - Swap should complete
# - Feedback should be submitted on-chain

# 5. Verify on-chain
# - Go to Celoscan
# - Search for ReputationRegistry contract
# - Check FeedbackGiven events
# - Verify agent reputation increased
```

---

## Deployment

### Deploy to Vercel

```bash
# 1. Push changes to GitHub
git add .
git commit -m "feat: add transaction history and ERC-8004 agent"
git push

# 2. Vercel auto-deploys on push

# 3. Add environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_AGENT_ID
# - NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY
# - NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY
```

### Deploy Contracts to Mainnet

```bash
# 1. Ensure contracts are tested on testnet

# 2. Deploy to mainnet
forge create --rpc-url https://forno.celo.org \
  --private-key $MAINNET_PRIVATE_KEY \
  src/IdentityRegistry.sol:IdentityRegistry

# 3. Register agent on mainnet
DEPLOYER_PRIVATE_KEY=$MAINNET_PRIVATE_KEY npx ts-node scripts/register-agent.ts

# 4. Update environment variables with mainnet addresses
```

---

## Troubleshooting

### Transaction Not Saving

**Problem**: Swap completes but transaction doesn't appear in history

**Solutions**:

1. Check browser console for errors
2. Verify Supabase credentials in `.env.local`
3. Check Supabase dashboard for table and policies
4. Verify user address is being passed correctly

### Agent Feedback Not Submitting

**Problem**: Swap completes but agent reputation doesn't increase

**Solutions**:

1. Verify `NEXT_PUBLIC_AGENT_ID` is set
2. Check contract addresses are correct
3. Verify wallet has CELO for gas fees
4. Check Celoscan for failed transactions
5. Ensure contracts are deployed to correct network

### Supabase Connection Issues

**Problem**: "Supabase not configured" warning

**Solutions**:

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Check credentials are correct (copy from Supabase dashboard)
3. Verify project is active in Supabase
4. Check network connectivity

---

## Next Steps

1. ✅ Set up Supabase for transaction history
2. ✅ Deploy ERC-8004 contracts
3. ✅ Register agent on-chain
4. ✅ Test both features
5. ✅ Deploy to production
6. Monitor transaction history and agent reputation
7. Iterate based on user feedback

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [ERC-8004 Standard](https://erc8004.org)
- [Celo Docs](https://docs.celo.org)
- [Foundry Book](https://book.getfoundry.sh)
