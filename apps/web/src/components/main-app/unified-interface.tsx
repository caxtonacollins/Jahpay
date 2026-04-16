"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

import { TransactionInterface } from "./core/transaction-interface";

export function UnifiedInterface() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary blue orb */}
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            animation: "float 9s ease-in-out infinite",
          }}
        />
        {/* Secondary green orb */}
        <div
          className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
            animation: "float-delayed 12s ease-in-out infinite",
          }}
        />
        {/* Mid blue accent */}
        <div
          className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="container relative z-10 max-w-lg mx-auto px-4 mt-8">
        {/* Tagline above card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center mb-6"
        >
          <p className="text-xs font-medium text-white/30 uppercase tracking-[0.2em]">
            Powered by Celo · DeFi Made Simple
          </p>
        </motion.div>

        <TransactionInterface />
      </div>
    </div>
  );
}
