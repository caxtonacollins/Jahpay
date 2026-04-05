'use client';

import { useMiniPayContext } from '@/contexts/minipay-context';

/**
 * Hook to detect and use MiniPay wallet
 * Returns whether the app is running inside MiniPay
 */
export function useMiniPay() {
    const { isMiniPay, isLoading, userAddress } = useMiniPayContext();
    return { isMiniPay, isLoading, userAddress };
}

/**
 * Get the user's address from MiniPay without any library
 */
export async function getMiniPayAddress(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const ethereum = (window as any).ethereum;
    if (!ethereum || !ethereum.isMiniPay) return null;

    try {
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts',
            params: [],
        });
        return accounts[0] || null;
    } catch (error) {
        console.error('Failed to get MiniPay address:', error);
        return null;
    }
}

/**
 * Check if app is running inside MiniPay
 */
export function isRunningInMiniPay(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.ethereum && (window.ethereum as any).isMiniPay);
}
