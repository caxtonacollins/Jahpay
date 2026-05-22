/**
 * ERC-8004 Agent On-Chain Integration
 * Handles agent registration and feedback submission to Celo blockchain
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { celo } from 'viem/chains';
import type { SwapQuote } from '../swap/usdc-usdt-swap';

// ERC-8004 Identity Registry ABI (minimal)
const IDENTITY_REGISTRY_ABI = parseAbi([
    'function register(string memory uri) public returns (uint256)',
    'function getAgent(uint256 agentId) public view returns (address owner, string memory uri, uint256 createdAt)',
]);

// ERC-8004 Reputation Registry ABI (minimal)
const REPUTATION_REGISTRY_ABI = parseAbi([
    'function giveFeedback(uint256 agentId, uint256 score, uint256 weight, string memory tag, string memory comment, string memory endpoint, string memory feedbackUri, bytes32 hash) public',
    'function getSummary(uint256 agentId) public view returns (uint256 averageScore, uint256 totalFeedback, uint256 successRate)',
]);

const IDENTITY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY as `0x${string}` | undefined;
const REPUTATION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY as `0x${string}` | undefined;

export class ERC8004Agent {
    private static publicClient = createPublicClient({
        chain: celo,
        transport: http(),
    });

    /**
     * Register agent on-chain (one-time operation)
     * Must be called with a private key that has funds
     */
    static async registerAgent(
        privateKey: `0x${string}`,
        agentUri: string
    ): Promise<{ success: boolean; agentId?: number; error?: string }> {
        try {
            if (!IDENTITY_REGISTRY_ADDRESS) {
                return {
                    success: false,
                    error: 'Identity Registry address not configured',
                };
            }

            const walletClient = createWalletClient({
                chain: celo,
                transport: http(),
                account: privateKey,
            });

            // Register agent
            const hash = await walletClient.writeContract({
                address: IDENTITY_REGISTRY_ADDRESS,
                abi: IDENTITY_REGISTRY_ABI,
                functionName: 'register',
                args: [agentUri],
            });

            console.log('[ERC8004] Agent registration tx:', hash);

            // Wait for confirmation
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

            if (receipt.status === 'success') {
                console.log('[ERC8004] Agent registered successfully');
                return {
                    success: true,
                    error: undefined,
                };
            } else {
                return {
                    success: false,
                    error: 'Transaction failed',
                };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('[ERC8004] Registration failed:', message);
            return {
                success: false,
                error: message,
            };
        }
    }

    /**
     * Submit swap feedback to on-chain reputation registry
     */
    static async submitFeedback(
        agentId: number,
        quote: SwapQuote,
        txHash: string,
        success: boolean,
        privateKey?: `0x${string}`
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!REPUTATION_REGISTRY_ADDRESS) {
                console.warn('[ERC8004] Reputation Registry not configured, skipping feedback');
                return { success: true };
            }

            if (!privateKey) {
                console.warn('[ERC8004] Private key not provided, skipping feedback submission');
                return { success: true };
            }

            const walletClient = createWalletClient({
                chain: celo,
                transport: http(),
                account: privateKey,
            });

            const score = success ? 95 : 20;
            const tag = success ? 'swap_success' : 'swap_failed';
            const comment = success
                ? `Successful swap: ${quote.fromToken} → ${quote.toToken}`
                : `Failed swap: ${quote.fromToken} → ${quote.toToken}`;

            // Submit feedback
            const hash = await walletClient.writeContract({
                address: REPUTATION_REGISTRY_ADDRESS,
                abi: REPUTATION_REGISTRY_ABI,
                functionName: 'giveFeedback',
                args: [
                    BigInt(agentId),
                    BigInt(score),
                    BigInt(1), // weight
                    tag,
                    comment,
                    '', // endpoint
                    '', // feedbackUri
                    txHash as `0x${string}`, // hash
                ],
            });

            console.log('[ERC8004] Feedback submission tx:', hash);

            // Wait for confirmation
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

            if (receipt.status === 'success') {
                console.log('[ERC8004] Feedback submitted successfully');
                return { success: true };
            } else {
                return {
                    success: false,
                    error: 'Feedback transaction failed',
                };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('[ERC8004] Feedback submission failed:', message);
            // Don't fail the swap if feedback fails
            return { success: true };
        }
    }

    /**
     * Get agent reputation from on-chain registry
     */
    static async getReputation(agentId: number) {
        try {
            if (!REPUTATION_REGISTRY_ADDRESS) {
                return null;
            }

            const result = await this.publicClient.readContract({
                address: REPUTATION_REGISTRY_ADDRESS,
                abi: REPUTATION_REGISTRY_ABI,
                functionName: 'getSummary',
                args: [BigInt(agentId)],
            });

            const [averageScore, totalFeedback, successRate] = result as [bigint, bigint, bigint];

            return {
                averageScore: Number(averageScore),
                totalFeedback: Number(totalFeedback),
                successRate: Number(successRate),
            };
        } catch (error) {
            // Silently return null if agent doesn't exist yet or contract reverts
            // This is expected for new agents without feedback
            if (error instanceof Error && error.message.includes('execution reverted')) {
                return null;
            }
            console.error('[ERC8004] Failed to get reputation:', error);
            return null;
        }
    }
}
