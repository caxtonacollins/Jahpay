"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionType } from "./transaction-tabs";

interface TransactionSummaryProps {
  type: TransactionType;
  status: "loading" | "success" | "error";
  onReset: () => void;
}

export function TransactionSummary({
  type,
  status,
  onReset,
}: TransactionSummaryProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "loading":
        return "Processing your transaction...";
      case "success":
        return "Transaction completed successfully!";
      case "error":
        return "Transaction failed. Please try again.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Status</p>
          <p className="text-white font-medium mt-1">{getStatusMessage()}</p>
        </div>
        {status === "loading" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-8 h-8 border-2 border-celo-green/30 border-t-celo-green rounded-full" />
          </motion.div>
        )}
      </div>

      {status === "success" && (
        <div className="flex gap-2">
          <Button onClick={onReset} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
          <Button variant="ghost" className="flex-1" asChild>
            <a
              href="https://celoscan.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </a>
          </Button>
        </div>
      )}

      {status === "error" && (
        <Button onClick={onReset} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
