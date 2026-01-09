"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Loader } from "lucide-react";
import { useTransaction } from "@/lib/hooks/useTransactions";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";

interface TransactionStatusProps {
  transactionId: string;
}

export function TransactionStatus({ transactionId }: TransactionStatusProps) {
  const { address } = useAccount();
  const { data: transaction, isLoading } = useTransaction(
    transactionId,
    address
  );
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
      >
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading transaction status...</p>
        </div>
      </motion.div>
    );
  }

  if (!transaction) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Transaction not found</p>
        </div>
      </motion.div>
    );
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-16 h-16 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
      case "processing":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-10"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          {/* Status */}
          <h1 className={`text-3xl font-bold mb-2 ${getStatusColor()}`}>
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </h1>

          {/* Amount */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm">Amount</p>
            <p className="text-2xl font-bold text-white">
              {transaction.fiat_amount} {transaction.fiat_currency}
            </p>
            <p className="text-gray-500 text-sm">
              ≈ {transaction.crypto_amount} {transaction.crypto_currency}
            </p>
          </div>

          {/* Provider */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm">Provider</p>
            <p className="text-lg font-semibold text-white capitalize">
              {transaction.provider}
            </p>
          </div>

          {/* Transaction ID */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm">Transaction ID</p>
            <p className="text-sm font-mono text-gray-300 break-all">
              {transaction.id}
            </p>
          </div>

          {/* Details button */}
          {["completed", "failed"].includes(transaction.status) && (
            <Button
              variant="secondary"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-6"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          )}

          {/* Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/5 rounded-lg p-4 text-left mb-6 text-sm"
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchange Rate:</span>
                  <span className="text-white font-mono">
                    {transaction.exchange_rate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee:</span>
                  <span className="text-white font-mono">
                    {transaction.platform_fee} {transaction.fiat_currency}
                  </span>
                </div>
                {transaction.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">
                      {new Date(transaction.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {transaction.error_message && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error:</span>
                    <span className="text-red-400">
                      {transaction.error_message}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Next steps */}
          {transaction.status === "processing" && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-blue-300 text-sm">
                Your transaction is being processed. This usually takes 30-60
                minutes. We'll notify you when it's complete.
              </p>
            </div>
          )}

          {transaction.status === "failed" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-300 text-sm">
                We couldn’t complete this one. You weren’t charged. Try again or contact support.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            {transaction.status === "completed" && (
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/buy";
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start New Transaction
              </Button>
            )}
            {["pending", "processing"].includes(transaction.status) && (
              <Button variant="secondary" disabled>
                Processing
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/history";
                }
              }}
            >
              View History
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
