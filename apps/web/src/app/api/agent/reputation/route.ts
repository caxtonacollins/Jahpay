import { NextResponse } from 'next/server';
import { AGENT_CONFIG } from '@/lib/minipay/constants';
import { ERC8004Agent } from '@/lib/agent/erc8004-onchain';

export const runtime = 'nodejs';

export async function GET() {
  const agentId = AGENT_CONFIG.agentId;

  if (!agentId) {
    return NextResponse.json({
      agentId: null,
      averageScore: null,
      totalFeedback: 0,
      successRate: null,
      isRegistered: false,
    });
  }

  const agentIdNum = parseInt(agentId, 10);
  if (!isNaN(agentIdNum)) {
    const onChain = await ERC8004Agent.getReputation(agentIdNum);
    // Only return on-chain data if it exists and has feedback
    if (onChain && onChain.totalFeedback > 0) {
      return NextResponse.json({
        agentId,
        averageScore: onChain.averageScore,
        totalFeedback: onChain.totalFeedback,
        successRate: onChain.successRate,
        isRegistered: true,
        source: 'on-chain',
      });
    }
  }

  // Return pending state without attempting contract call if agent doesn't exist yet
  return NextResponse.json({
    agentId,
    averageScore: null,
    totalFeedback: 0,
    successRate: null,
    isRegistered: true,
    source: 'pending',
    message: 'Agent registered; on-chain reputation builds as users complete swaps.',
  });
}
