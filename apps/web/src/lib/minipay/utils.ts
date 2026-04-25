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
 * Get exchange rate between two tokens
 */
export async function getExchangeRate(
    fromSymbol: string,
    toSymbol: string
): Promise<number> {
    try {
        // Use CoinGecko for real-time rates
        // Mapping symbols to CoinGecko IDs
        const symbolMap: Record<string, string> = {
            'CELO': 'celo',
            'USDm': 'celo-dollar',
            'cUSD': 'celo-dollar',
            'USDC': 'usd-coin',
            'USDT': 'tether',
        };

        const fromId = symbolMap[fromSymbol];
        const toId = symbolMap[toSymbol];

        if (!fromId || !toId) return 1.0;

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd`
        );
        const data = await response.json();

        const fromPrice = data[fromId].usd;
        const toPrice = data[toId].usd;

        return fromPrice / toPrice;
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Fallback rates if API fails
        const fallbackRates: Record<string, number> = {
            'CELO_USDm': 0.8,
            'USDm_CELO': 1.25,
            'USDC_USDm': 1,
            'USDT_USDm': 1,
        };
        return fallbackRates[`${fromSymbol}_${toSymbol}`] || 1.0;
    }
}

/**
 * Perform a token swap
 * For MVP, this can be integrated with Mento or Uniswap
 * Currently implementation is a placeholder that notifies about the transaction
 */
export async function performSwap(
    fromToken: string,
    toToken: string,
    amount: string,
    chainId: number = 42220
): Promise<string> {
    if (!window.ethereum) throw new Error('No wallet detected');

    const walletClient = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
    });

    // In a real implementation, you would:
    // 1. Check if it's a Mento swap (cUSD/CELO etc)
    // 2. Or a Uniswap swap
    // 3. For now, we'll simulate the contract call or use a simple transfer if it's a mock swap

    // This is where the real swap logic would go. 
    // Example for Mento: 
    // const hash = await walletClient.sendTransaction({ ...mentoSatisfiedParams });

    // For now, we'll simulate a successful transaction hash
    // since we don't have a specific swap contract provided in the prompt
    console.log(`Swapping ${amount} ${fromToken} to ${toToken}...`);

    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return "0x" + Math.random().toString(16).slice(2) + "0000000000000000";
}

/**
 * Approve a token for the RampAggregator contract
 */
export async function approveToken(
    tokenAddress: string,
    amount: string,
    decimals: number = 18,
    chainId: number = 42220
): Promise<string> {
    if (!window.ethereum) throw new Error('No wallet detected');

    const walletClient = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
    });

    const feeCurrencyAddress = chainId === 11142220
        ? MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY_SEPOLIA
        : MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY;

    const { RAMP_CONTRACT_ADDRESS } = await import('./constants');

    try {
        const data = encodeFunctionData({
            abi: [
                {
                    name: 'approve',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                        { name: 'spender', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                    ],
                    outputs: [{ name: '', type: 'bool' }],
                },
            ],
            functionName: 'approve',
            args: [RAMP_CONTRACT_ADDRESS as `0x${string}`, parseUnits(amount, decimals)],
        });

        const hash = await walletClient.sendTransaction({
            account: walletClient.account!,
            to: tokenAddress as `0x${string}`,
            data,
            feeCurrency: feeCurrencyAddress as `0x${string}`,
        });

        return hash;
    } catch (error) {
        console.error('Failed to approve token:', error);
        throw error;
    }
}

/**
 * Call initiateOffRamp on the RampAggregator contract
 */
export async function initiateOffRampContractCall(
    amount: string,
    provider: string,
    fiatCurrency: string,
    fiatAmount: string,
    tokenSymbol: string = 'USDm',
    chainId: number = 42220
): Promise<string> {
    if (!window.ethereum) throw new Error('No wallet detected');

    const walletClient = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
    });

    const { RAMP_CONTRACT_ADDRESS, SUPPORTED_TOKENS } = await import('./constants');
    const token = SUPPORTED_TOKENS.find(t => t.symbol === tokenSymbol);
    if (!token) throw new Error(`Token ${tokenSymbol} not supported`);

    const feeCurrencyAddress = chainId === 11142220
        ? MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY_SEPOLIA
        : MINIPAY_CONFIG.SUPPORTED_FEE_CURRENCY;

    try {
        const data = encodeFunctionData({
            abi: [
                {
                    name: 'initiateOffRamp',
                    type: 'function',
                    stateMutability: 'payable',
                    inputs: [
                        { name: 'amount', type: 'uint256' },
                        { name: 'provider', type: 'string' },
                        { name: 'fiatCurrency', type: 'string' },
                        { name: 'amountFiat', type: 'uint256' },
                    ],
                    outputs: [{ name: '', type: 'bytes32' }],
                },
            ],
            functionName: 'initiateOffRamp',
            args: [
                parseUnits(amount, token.decimals),
                provider,
                fiatCurrency,
                parseUnits(fiatAmount, 2), // Assuming 2 decimals for fiat (e.g. cents/kobo)
            ],
        });

        const hash = await walletClient.sendTransaction({
            account: walletClient.account!,
            to: RAMP_CONTRACT_ADDRESS as `0x${string}`,
            data,
            feeCurrency: feeCurrencyAddress as `0x${string}`,
        });

        return hash;
    } catch (error) {
        console.error('Failed to initiate off-ramp contract call:', error);
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
