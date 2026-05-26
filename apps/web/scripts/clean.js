#!/usr/bin/env node

const { createPublicClient, createWalletClient, http, parseEther } = require('viem');
const { celo, celoAlfajores } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Configuration from .env
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS || '0x';
const PRIVATE_KEY = process.env.AGENT_DEPLOYER_PRIVATE_KEY || '';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '42220');
const INTERVAL = 10000; // 10 seconds

// Select chain based on CHAIN_ID
const chain = CHAIN_ID === 11142220 ? celoAlfajores : celo;
const RPC_URL = chain.rpcUrls.default.http[0];

async function writeToContract() {
  try {
    if (!PRIVATE_KEY) {
      throw new Error('AGENT_DEPLOYER_PRIVATE_KEY environment variable is required');
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x') {
      throw new Error('NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS environment variable is required');
    }

    // Setup account and clients
    const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace('0x', '')}`);

    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    });

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(RPC_URL),
    });

    console.log(`Starting contract writes every ${INTERVAL / 1000} seconds...`);
    console.log(`Chain: ${chain.name} (ID: ${chain.id})`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Account: ${account.address}`);
    console.log('');

    let count = 0;

    // Write to contract every 10 seconds
    setInterval(async () => {
      try {
        count++;
        const timestamp = new Date().toISOString();

        console.log(`[${timestamp}] Attempt #${count}: Sending transaction...`);

        // Send native CELO (0.001 CELO)
        const amount = parseEther('0.001');

        const hash = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: amount,
          account,
        });

        console.log(`[${timestamp}] Transaction sent: ${hash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`[${timestamp}] ✓ Confirmed (Block: ${receipt.blockNumber})`);
        console.log('');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[${new Date().toISOString()}] ✗ Error:`, errorMessage);
        console.log('');
      }
    }, INTERVAL);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', errorMessage);
    process.exit(1);
  }
}

writeToContract();
