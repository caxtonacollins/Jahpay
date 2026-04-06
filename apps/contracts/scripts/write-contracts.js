#!/usr/bin/env node

const ethers = require('ethers');
require('dotenv').config();

// Configuration
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RAMP_AGGREGATOR_ADDRESS = process.env.RAMP_AGGREGATOR_ADDRESS || '0xA7800f93677723c1e3238ECd4bfDB2fa82DF4Fe0';
const FEE_COLLECTOR_ADDRESS = process.env.FEE_COLLECTOR_ADDRESS || '0x5c043e1D09495F04a9f33551c49CE244c8226C46';

// ============ RampAggregator ABI ============
const RAMP_AGGREGATOR_ABI = [
  'function feeBps() external view returns (uint256)',
  'function backendSigner() external view returns (address)',
  'function paused() external view returns (bool)',
  'function isProviderActive(string memory provider) external view returns (bool)',
  'function setFee(uint256 _feeBps) external',
  'function setProviderConfig(string memory provider, bool active, uint256 minAmount, uint256 maxAmount, uint256 _feeBps) external',
  'function setBackendSigner(address newSigner) external',
  'function pause() external',
  'function unpause() external',
];

async function writeToContracts() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`[${new Date().toISOString()}] Writing to contracts...`);
    console.log(`Wallet: ${wallet.address}`);

    const rampAggregator = new ethers.Contract(
      RAMP_AGGREGATOR_ADDRESS,
      RAMP_AGGREGATOR_ABI,
      wallet
    );

    // ============ RampAggregator Write Operations ============

    // Check current fee and set a different one
    try {
      const currentFee = await rampAggregator.feeBps();
      const newFee = 100 + Math.floor(Math.random() * 100);
      
      if (currentFee.toString() !== newFee.toString()) {
        console.log(`  → setFee (current: ${currentFee} → new: ${newFee} bps)...`);
        const tx = await rampAggregator.setFee(newFee);
        console.log(`    ✓ ${tx.hash}`);
        await tx.wait();
      } else {
        console.log(`  → setFee (skipped - already set to ${newFee} bps)`);
      }
    } catch (e) {
      console.log(`    ✗ ${e.message.split('\n')[0]}`);
    }

    // Check and update provider configs
    const minAmount = ethers.parseEther((0.1 + Math.random() * 0.1).toString());
    const maxAmount = ethers.parseEther((10 + Math.random() * 5).toString());
    
    for (const provider of ['yellowcard', 'cashramp', 'bitmama']) {
      try {
        const isActive = await rampAggregator.isProviderActive(provider);
        console.log(`  → setProviderConfig (${provider} - active: ${isActive})...`);
        const tx = await rampAggregator.setProviderConfig(
          provider,
          true,
          minAmount,
          maxAmount,
          100
        );
        console.log(`    ✓ ${tx.hash}`);
        await tx.wait();
      } catch (e) {
        console.log(`    ✗ ${e.message.split('\n')[0]}`);
      }
    }

    // Check current backend signer and update if different
    try {
      const currentSigner = await rampAggregator.backendSigner();
      if (currentSigner.toLowerCase() !== process.env.PAUSER.toLowerCase()) {
        console.log(`  → setBackendSigner (current: ${currentSigner} → new: ${process.env.PAUSER})...`);
        const tx = await rampAggregator.setBackendSigner(process.env.PAUSER);
        console.log(`    ✓ ${tx.hash}`);
        await tx.wait();
      } else {
        console.log(`  → setBackendSigner (skipped - already set to ${process.env.PAUSER})`);
      }
    } catch (e) {
      console.log(`    ✗ ${e.message.split('\n')[0]}`);
    }

    // Check pause state and toggle if needed
    try {
      const isPaused = await rampAggregator.paused();
      if (!isPaused) {
        console.log('  → pause (currently unpaused)...');
        const tx = await rampAggregator.pause();
        console.log(`    ✓ ${tx.hash}`);
        await tx.wait();
      } else {
        console.log('  → unpause (currently paused)...');
        const tx = await rampAggregator.unpause();
        console.log(`    ✓ ${tx.hash}`);
        await tx.wait();
      }
    } catch (e) {
      console.log(`    ✗ ${e.message.split('\n')[0]}`);
    }

    console.log('✓ Write operations completed\n');
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
  }
}

async function startScheduler() {
  console.log('Starting contract writer scheduler...');
  console.log(`Interval: ${INTERVAL_MS / 1000 / 60} minutes`);
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`RampAggregator: ${RAMP_AGGREGATOR_ADDRESS}\n`);

  // Run immediately on start
  await writeToContracts();

  // Then run every 5 minutes
  setInterval(writeToContracts, INTERVAL_MS);
}

startScheduler().catch(console.error);
