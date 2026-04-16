"use client";

import { TransactionList } from "@/components/transactions/transaction-list";

export default function HistoryPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">History</h1>
        <TransactionList limit={20} showFilters showTitle={false} />
    </div>
  );
}
