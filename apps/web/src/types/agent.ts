/**
 * ERC-8004 Agent domain types
 */

export interface AgentRecommendation {
    /** Recommended slippage in BPS (10–200) */
    recommendedSlippageBps: number;
    /** "optimal" | "volatile" | "normal" */
    marketCondition: 'optimal' | 'normal' | 'volatile';
    /** 0–100 confidence in the recommendation */
    confidence: number;
    /** Human-readable message to show in UI */
    message: string;
    /** AI badge text for the swap button */
    badge: string;
    /** Whether to show the AI-optimized badge */
    showBadge: boolean;
}

export interface AgentReputation {
    agentId: string | null;
    averageScore: number | null;
    totalFeedback: number;
    successRate: number | null;
    isRegistered: boolean;
}
