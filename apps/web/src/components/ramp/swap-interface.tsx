"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { CountrySelector } from "./country-selector";
import { FeeBreakdown } from "./fee-breakdown";

interface SwapInterfaceProps {
  type: "buy" | "sell";
  amount: string;
  onAmountChange: (amount: string) => void;
  fiatCurrency: string;
  onFiatChange: (currency: string) => void;
  cryptoCurrency: string;
  onCryptoChange: (currency: string) => void;
  exchangeRate?: any;
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function SwapInterface({
  type,
  amount,
  onAmountChange,
  fiatCurrency,
  onFiatChange,
  cryptoCurrency,
  onCryptoChange,
  exchangeRate,
  selectedProvider,
  onProviderChange,
  onSubmit,
  isLoading = false,
}: SwapInterfaceProps) {
  const convertedAmount = exchangeRate
    ? (parseFloat(amount) * exchangeRate.rate).toFixed(6)
    : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <GlassCard className="p-6">
        <div className="space-y-6">
          {/* From (Input) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {type === "buy" ? "Pay With" : "Send"}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={fiatCurrency}
                onChange={(e) => onFiatChange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            {type === "buy" && (
              <CountrySelector value={fiatCurrency} onChange={onFiatChange} />
            )}
          </div>

          {/* Swap arrow */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white transition-colors"
            >
              <ArrowDownUp className="w-5 h-5" />
            </motion.button>
          </div>

          {/* To (Output) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {type === "buy" ? "Receive" : "To"}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={convertedAmount}
                  readOnly
                  placeholder="0.00"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none opacity-75"
                />
              </div>
              <select
                value={cryptoCurrency}
                onChange={(e) => onCryptoChange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="cUSD">cUSD</option>
                <option value="CELO">CELO</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {/* Rate info */}
          {exchangeRate && (
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Rate:</span>
                <span className="font-mono">
                  1 {fiatCurrency} = {exchangeRate.rate?.toFixed(6)}{" "}
                  {cryptoCurrency}
                </span>
              </div>
              {exchangeRate.fee && (
                <div className="flex justify-between text-gray-400 mt-2">
                  <span>Fee:</span>
                  <span className="text-red-400">
                    -{parseFloat(exchangeRate.fee).toFixed(2)} {fiatCurrency}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Provider selection */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Select Provider
        </h3>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="yellowcard">Yellow Card</option>
          <option value="cashramp">Cashramp</option>
          <option value="bitmama">Bitmama</option>
        </select>
      </div>

      {/* Fee breakdown */}
      {exchangeRate && (
        <FeeBreakdown
          subtotal={parseFloat(amount) || 0}
          fees={[
            {
              label: "Platform Fee",
              amount: (parseFloat(amount) || 0) * 0.015,
              percentage: 1.5,
            },
            {
              label: "Provider Fee",
              amount: (parseFloat(amount) || 0) * 0.02,
              percentage: 2,
            },
          ]}
          total={(parseFloat(amount) || 0) * 1.035}
          currency={fiatCurrency}
        />
      )}

      {/* Submit button */}
      <Button
        onClick={onSubmit}
        disabled={!amount || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <motion.div className="flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </motion.div>
        ) : type === "buy" ? (
          "Continue to Payment"
        ) : (
          "Confirm Sell"
        )}
      </Button>
    </motion.div>
  );
}
