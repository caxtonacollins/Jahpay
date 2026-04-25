import { Mento, ChainId, deadlineFromMinutes } from '@mento-protocol/mento-sdk';
import { parseUnits, formatUnits } from 'viem';
import { SUPPORTED_TOKENS } from '../minipay/constants';

/**
 * Get token address for Mento swaps
 */
function getTokenAddressForMento(symbol: string, chainId: number): string {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    if (!token) throw new Error(`Token ${symbol} not supported`);

    if (chainId === 11142220) {
        return (token as any).addressSepolia || token.address;
    }
    return token.address;
}

/**
 * Get Mento SDK instance
 */
async function getMentoInstance(chainId: number = 42220) {
    // Map chainId to Mento ChainId
    const mentoChainId = chainId === 11142220 ? ChainId.CELO_SEPOLIA : ChainId.CELO;
    return await Mento.create(mentoChainId);
}

/**
 * Get a swap quote from Mento
 * @param fromToken - Token symbol (e.g., 'USDm', 'CELO', 'USDC')
 * @param toToken - Token symbol
 * @param amount - Amount in human-readable format (e.g., '100')
 * @param chainId - Chain ID (42220 for mainnet, 11142220 for Sepolia)
 * @returns Quote with expected output amount
 */
export async function getMentoQuote(
    fromToken: string,
    toToken: string,
    amount: string,
    chainId: number = 42220
): Promise<{
    amountIn: string;
    amountOut: string;
    rate: number;
    fromToken: string;
    toToken: string;
}> {
    try {
        const mento = await getMentoInstance(chainId);

        const fromTokenAddress = getTokenAddressForMento(fromToken, chainId);
        const toTokenAddress = getTokenAddressForMento(toToken, chainId);

        const fromTokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === fromToken);
        const toTokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === toToken);

        if (!fromTokenInfo || !toTokenInfo) {
            throw new Error('Invalid token pair');
        }

        // Parse amount with correct decimals
        const amountInParsed = parseUnits(amount, fromTokenInfo.decimals);

        // Get quote
        const amountOut = await mento.quotes.getAmountOut(
            fromTokenAddress,
            toTokenAddress,
            amountInParsed
        );

        const amountOutFormatted = formatUnits(amountOut, toTokenInfo.decimals);
        const rate = parseFloat(amountOutFormatted) / parseFloat(amount);

        return {
            amountIn: amount,
            amountOut: amountOutFormatted,
            rate,
            fromToken,
            toToken,
        };
    } catch (error) {
        console.error('Mento quote error:', error);
        throw new Error(
            `Failed to get Mento quote: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Build a swap transaction using Mento SDK
 * @param fromToken - Token symbol
 * @param toToken - Token symbol
 * @param amount - Amount in human-readable format
 * @param recipientAddress - Address to receive output tokens
 * @param ownerAddress - Address that holds input tokens and signs tx
 * @param chainId - Chain ID
 * @param slippageTolerance - Slippage tolerance in percentage (e.g., 0.5 for 0.5%)
 * @returns Transaction parameters for approval (if needed) and swap
 */
export async function buildMentoSwapTransaction(
    fromToken: string,
    toToken: string,
    amount: string,
    recipientAddress: string,
    ownerAddress: string,
    chainId: number = 42220,
    slippageTolerance: number = 0.5
) {
    try {
        const mento = await getMentoInstance(chainId);

        const fromTokenAddress = getTokenAddressForMento(fromToken, chainId);
        const toTokenAddress = getTokenAddressForMento(toToken, chainId);

        const fromTokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === fromToken);
        if (!fromTokenInfo) throw new Error(`Token ${fromToken} not supported`);

        const amountInParsed = parseUnits(amount, fromTokenInfo.decimals);

        // Build swap transaction
        const { approval, swap } = await mento.swap.buildSwapTransaction(
            fromTokenAddress,
            toTokenAddress,
            amountInParsed,
            recipientAddress,
            ownerAddress,
            {
                slippageTolerance,
                deadline: deadlineFromMinutes(5),
            }
        );

        return {
            approval: approval || null,
            swap,
        };
    } catch (error) {
        console.error('Mento swap build error:', error);
        throw new Error(
            `Failed to build Mento swap: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Check if a token pair is tradable on Mento
 */
export async function isMentoPairTradable(
    fromToken: string,
    toToken: string,
    chainId: number = 42220
): Promise<boolean> {
    try {
        const mento = await getMentoInstance(chainId);

        const fromTokenAddress = getTokenAddressForMento(fromToken, chainId);
        const toTokenAddress = getTokenAddressForMento(toToken, chainId);

        return await mento.trading.isPairTradable(fromTokenAddress, toTokenAddress);
    } catch (error) {
        console.error('Mento tradable check error:', error);
        return false;
    }
}
