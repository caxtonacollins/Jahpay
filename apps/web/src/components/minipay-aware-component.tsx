"use client";

import { useMiniPay } from "@/hooks/useMiniPay";
import { useEffect, useState } from "react";

/**
 * Example component showing how to create MiniPay-aware components
 * This component adapts its UI based on whether it's running in MiniPay or normal website
 */
export function MiniPayAwareComponent() {
  const { isMiniPay, isLoading, userAddress } = useMiniPay();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Show different UI based on environment */}
      {isMiniPay ? (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">MiniPay Mode</h3>
          <p className="text-sm text-gray-300 mb-2">
            You&apos;re using jahpay as a MiniPay Mini App
          </p>
          {userAddress && (
            <p className="text-xs text-gray-400 break-all">
              Address: {userAddress}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            ✓ Wallet is automatically connected
          </p>
        </div>
      ) : (
        <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
          <h3 className="text-purple-400 font-semibold mb-2">Website Mode</h3>
          <p className="text-sm text-gray-300">
            You&apos;re using jahpay as a normal website
          </p>
          <p className="text-xs text-gray-400 mt-2">
            ✓ Use the Connect Wallet button to connect your wallet
          </p>
        </div>
      )}

      {/* Example: Show different features based on mode */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Available Features</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {isMiniPay
              ? "MiniPay Stablecoin Transfers"
              : "Multi-wallet Support"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {isMiniPay ? "USDm, USDC, USDT" : "All Celo Tokens"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {isMiniPay ? "Celo Mainnet & Sepolia" : "Multiple Networks"}
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example: Component that only renders in MiniPay
 */
export function MiniPayOnlyComponent() {
  const { isMiniPay, isLoading } = useMiniPay();

  if (isLoading) return null;
  if (!isMiniPay) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
      <p className="text-blue-400 text-sm">
        This feature is only available in MiniPay
      </p>
    </div>
  );
}

/**
 * Example: Component that only renders on normal website
 */
export function WebsiteOnlyComponent() {
  const { isMiniPay, isLoading } = useMiniPay();

  if (isLoading) return null;
  if (isMiniPay) return null;

  return (
    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
      <p className="text-purple-400 text-sm">
        This feature is only available on the website
      </p>
    </div>
  );
}
