/**
 * Swap domain types
 */

export type SwapTokenSymbol = 'USDC' | 'USDT';

export interface SwapQuote {
    fromToken: SwapTokenSymbol;
    toToken: SwapTokenSymbol;
    amountIn: string;
    /** Gross amount before fee */
    amountOutGross: string;
    /** Net amount user receives after platform fee */
    amountOutNet: string;
    /** Platform fee in output token */
    platformFee: string;
    platformFeePercent: number;
    /** Exchange rate (net) */
    rate: number;
    /** Is this a direct swap or routed via USDm? */
    route: 'direct' | 'via-usdm';
    /** Slippage tolerance in BPS used for this quote */
    slippageBps: number;
    /** Is the pair currently tradable? */
    isTradable: boolean;
    timestamp: number;
}

export interface SwapTransaction {
    approval: any | null;
    swap: any;
    quote: SwapQuote;
}
