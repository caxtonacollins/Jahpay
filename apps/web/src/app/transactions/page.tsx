"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionList } from "@/components/transactions/transaction-list";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <main className="flex-1 jahpay-bg jahpay-grid">
      {/* Section overlay */}
      <div className="absolute inset-0 -z-10 section-overlay-hero" />
      <div className="container max-w-4xl mx-auto px-4 py-10 relative z-10">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600 mt-2">
            View and manage your transaction history
          </p> */}
        </div>
        <TransactionList />
      </div>
    </main>
  );
}
