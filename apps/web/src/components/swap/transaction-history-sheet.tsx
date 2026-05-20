"use client";

import React from "react";
import { History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TransactionList } from "@/components/transactions/transaction-list";
import { cn } from "@/lib/utils";

interface TransactionHistorySheetProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionHistoryIconButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Transaction history"
      aria-label="Transaction history"
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center",
        "bg-white/[0.06] border border-white/[0.1] text-white/50",
        "hover:text-white hover:border-white/20 hover:bg-white/[0.1] transition-all",
        className,
      )}
    >
      <History className="w-4 h-4" />
    </button>
  );
}

export function TransactionHistorySheet({
  open,
  onClose,
}: TransactionHistorySheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[80vh] overflow-hidden bg-[#0d111c] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-white/60" />
                <h3 className="text-sm font-bold text-white">Transaction History</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <TransactionList limit={20} showFilters showTitle={false} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
