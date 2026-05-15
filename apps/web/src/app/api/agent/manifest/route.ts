import { NextResponse } from 'next/server';
import { AGENT_CONFIG } from '@/lib/minipay/constants';

export const runtime = 'edge';

/**
 * ERC-8004 Agent Manifest
 * Served at /api/agent/manifest and referenced as agentURI in the on-chain registry.
 * Compatible with the ERC-8004 Agent Trust Protocol specification.
 */
export async function GET() {
  const manifest = {
    type: 'Agent',
    name: AGENT_CONFIG.name,
    description: AGENT_CONFIG.description,
    version: '1.0.0',
    image: 'https://jahpay.app/agent-avatar.png',
    endpoints: [
      {
        type: 'a2a',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jahpay.app'}/.well-known/agent.json`,
      },
      {
        type: 'mcp',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jahpay.app'}/api/agent/mcp`,
      },
      {
        type: 'wallet',
        address: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS || '0x0000000000000000000000000000000000000000',
        chainId: AGENT_CONFIG.chainId,
      },
    ],
    capabilities: [
      'swap-optimization',
      'slippage-recommendation',
      'rate-monitoring',
      'circuit-breaker-detection',
    ],
    supportedPairs: [
      { from: 'USDC', to: 'USDT', chain: 'celo' },
      { from: 'USDT', to: 'USDC', chain: 'celo' },
    ],
    supportedTrust: ['reputation', 'validation'],
    protocol: {
      dex: 'Mento Protocol v3',
      chain: 'Celo Mainnet',
      chainId: 42220,
    },
    links: {
      app: 'https://jahpay.app',
      docs: 'https://github.com/caxtonacollins/Jahpay',
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
