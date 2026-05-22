# Jahpay AI Agent — Testnet & Production Deployment

The Jahpay Swap Agent uses **live Mento Protocol data** for quotes, slippage, and chat. On-chain identity uses **ERC-8004** on Celo when registry contracts are configured.

## Architecture

| Layer           | Path                                                 | Role                                 |
| --------------- | ---------------------------------------------------- | ------------------------------------ |
| Intelligence    | `apps/web/src/lib/agent/agent-intelligence.ts`       | Mento quotes, intent detection, chat |
| Chat API        | `apps/web/src/app/api/agent/chat/route.ts`           | User ↔ agent messages                |
| Recommendations | `apps/web/src/app/api/agent/recommendation/route.ts` | Slippage from live oracle            |
| Reputation      | `apps/web/src/app/api/agent/reputation/route.ts`     | On-chain ERC-8004 scores             |
| Manifest        | `apps/web/src/app/api/agent/manifest/route.ts`       | ERC-8004 agent URI                   |
| On-chain        | `apps/web/src/lib/agent/erc8004-onchain.ts`          | Register + feedback                  |

## Environment Variables

```bash
# Required for production
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_CHAIN_ID=42220          # 11142220 for Celo Sepolia testnet

# Agent (after registration)
NEXT_PUBLIC_AGENT_ID=1
NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY=0x...
NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY=0x...

# Server-only (never expose to client)
AGENT_DEPLOYER_PRIVATE_KEY=0x...    # Funded wallet for register + feedback
THIRDWEB_SECRET_KEY=                # Premium x402 analysis
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS=

# Optional persistence
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Testnet Deployment (Celo Sepolia)

### 1. Configure the app for Sepolia

```bash
# apps/web/.env.local
NEXT_PUBLIC_CHAIN_ID=11142220
```

Users must connect wallet to **Celo Sepolia** (chain ID `11142220`). Wagmi already includes this chain in `wallet-provider.tsx`.

### 2. Get test CELO

- [Celo Sepolia Faucet](https://faucet.celo.org/)
- [Alchemy Celo Sepolia Faucet](https://www.alchemy.com/faucets/celo-sepolia-faucet)

### 3. Register the ERC-8004 agent (one-time)

When ERC-8004 registries are deployed on Sepolia:

1. Set `NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY` and `AGENT_DEPLOYER_PRIVATE_KEY`
2. Run registration (example script pattern):

```typescript
import { ERC8004Agent } from "./apps/web/src/lib/agent/erc8004-onchain";

const uri = "https://jahpay.vercel.app/api/agent/manifest";
const result = await ERC8004Agent.registerAgent(
  process.env.AGENT_DEPLOYER_PRIVATE_KEY as `0x${string}`,
  uri,
);
```

3. Store returned agent ID: `NEXT_PUBLIC_AGENT_ID=<tokenId>`

**Note:** ERC-8004 mainnet addresses are still being finalized in the ecosystem. Until registries are live on your target network, the agent operates in **off-chain intelligence mode** (live Mento data + chat) without on-chain reputation.

### 4. Verify agent endpoints

```bash
curl https://localhost:3000/api/agent/manifest
curl -X POST https://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the rate for 100 USDC?","chainId":11142220}'
curl https://localhost:3000/api/agent/reputation
```

### 5. Test a swap on Sepolia

1. `pnpm dev` from repo root
2. Connect wallet → Celo Sepolia
3. Swap USDC ↔ USDT (testnet token addresses in `constants.ts`)
4. Confirm transaction on Blockscout: `https://celo-sepolia.blockscout.com`

## Production Deployment (Celo Mainnet)

1. Set `NEXT_PUBLIC_CHAIN_ID=42220`
2. Deploy `FeeCollector` contract: `apps/contracts/deploy-mainnet.sh`
3. Set `NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS`
4. Register agent on mainnet ERC-8004 registries when available
5. Build: `pnpm build`
6. Deploy Next.js app (Vercel, etc.) with all env vars

## User Chat

Users interact via the **Chat** tab on the AI Agent panel:

- Live rates: _"What's the rate for 500 USDC?"_
- Quotes: _"Quote 1000 USDT to USDC"_
- Slippage: _"Recommend slippage for 5000 USDC"_
- Status: _"Is USDC/USDT tradable?"_
- Providers: _"What DEXes are on Celo?"_

**Prepare swap** actions populate the swap form automatically.

## Premium Analysis (x402)

Requires `THIRDWEB_SECRET_KEY` and `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`. Users pay $0.05 via x402 for live Mento market snapshot (no mock data).

## Troubleshooting

| Issue                  | Fix                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Quotes fail on Sepolia | Ensure wallet is on Celo Sepolia, not Alfajores                                      |
| Agent reputation empty | Normal until on-chain feedback; complete swaps with `AGENT_DEPLOYER_PRIVATE_KEY` set |
| Premium unlock fails   | Check thirdweb env vars and fee collector address                                    |
| No transaction history | Complete a swap; data persists in localStorage + Supabase if configured              |
