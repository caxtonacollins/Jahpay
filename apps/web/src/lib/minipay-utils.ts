import { createPublicClient, createWalletClient, custom, http, formatEther, fromHex, encodeFunctionData, parseUnits } from 'viem';
import { celo } from 'viem/chains';
import { MINIPAY_CONFIG, SUPPORTED_TOKENS } from './constants';

/**
 * Get the appropriate token address based on chain
 */
export function getTokenAddress(symbol: string, chainId: number): string {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    if (!token) throw new Error(`Token ${symbol} not supported`);

    if (chainId === 11142220) {
        return (token as any).addressSepolia || token.address;
    }
    return token.address;
}

/**
 * Get stablecoin balance for an address
 */
export async function getStablecoinBalance(
    address: string,
    tokenSymbol: string = 'USDm',
    chainId: number = 42220
): Promise<string> {
    const publicClient = createPublicClient({
        chain: celo,
        transport: http(),
    });

    const tokenAddress = getTokenAddress(tokenSymbol, chainId);
    const token = SUPPORTED_TOKENS.find(t => t.symbol === tokenSymbol);
    if (!token) throw new Error(`Token ${tokenSymbol} not supported`);

    try {
        const balance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: [
                {
                    name: 'balanceOf',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'account', type: 'address' }],
                    outputs: [{ name: 'balance', type: 'uint256' }],
                },
            ],
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
        });

        return formatEther(BigInt(balance.toString()));
    } catch (error) {
        console.error(`Failed to get ${tokenSymbol} balance:`, error);
        throw error;
    }
}

/**
 * Estimate gas for a transaction in stablecoin (USDm)
 */
export async function estimateGasInStablecoin(
    transaction: any,
    chainId: number = 42220
): Promise<string> {
    const publicClient = createPublicClient({
        chain: celo,
        transport: http(),
    });

    const feeCurrencyAddress = chainId === 11142220
        ? MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY_SEPOLIA
        : MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY;

    try {
        const gasLimit = await publicClient.estimateGas({
            ...transaction,
            feeCurrency: feeCurrencyAddress,
        });

        const gasPrice = await publicClient.request({
            method: 'eth_gasPrice',
            params: [] as any,
        });

        const gasPriceBigInt = fromHex(gasPrice as `0x${string}`, 'bigint');
        const totalFeeInWei = gasLimit * gasPriceBigInt;

        return formatEther(totalFeeInWei);
    } catch (error) {
        console.error('Failed to estimate gas:', error);
        throw error;
    }
}

/**
 * Send a stablecoin transfer transaction
 * MiniPay only supports legacy transactions (no EIP-1559)
 */
export async function sendStablecoinTransfer(
    to: string,
    amount: string,
    tokenSymbol: string = 'USDm',
    chainId: number = 42220
): Promise<string> {
    if (!window.ethereum) throw new Error('No wallet detected');

    const walletClient = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
    });

    const token = SUPPORTED_TOKENS.find(t => t.symbol === tokenSymbol);
    if (!token) throw new Error(`Token ${tokenSymbol} not supported`);

    const tokenAddress = getTokenAddress(tokenSymbol, chainId);
    const feeCurrencyAddress = chainId === 11142220
        ? MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY_SEPOLIA
        : MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY;

    try {
        const data = encodeFunctionData({
            abi: [
                {
                    name: 'transfer',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                    ],
                    outputs: [{ name: '', type: 'bool' }],
                },
            ],
            functionName: 'transfer',
            args: [to as `0x${string}`, parseUnits(amount, token.decimals)],
        });

        // MiniPay only accepts legacy transactions
        const hash = await walletClient.sendTransaction({
            account: walletClient.account!,
            to: tokenAddress as `0x${string}`,
            data,
            feeCurrency: feeCurrencyAddress as `0x${string}`,
            // Legacy transaction - no maxFeePerGas or maxPriorityFeePerGas
        });

        return hash;
    } catch (error) {
        console.error('Failed to send stablecoin transfer:', error);
        throw error;
    }
}

/**
 * Check if a transaction succeeded
 */
export async function checkTransactionStatus(
    transactionHash: string,
    chainId: number = 42220
): Promise<boolean> {
    const publicClient = createPublicClient({
        chain: celo,
        transport: http(),
    });

    try {
        const receipt = await publicClient.getTransactionReceipt({
            hash: transactionHash as `0x${string}`,
        });

        return receipt?.status === 'success';
    } catch (error) {
        console.error('Failed to check transaction status:', error);
        throw error;
    }
}

/**
 * Get supported stablecoins for MiniPay
 */
export function getSupportedStablecoins() {
    return SUPPORTED_TOKENS.map(token => ({
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logo: token.logo,
    }));
}
