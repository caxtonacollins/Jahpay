"use client";

import { useParams } from "next/navigation";
import { TransactionStatus } from "@/components/ramp/transaction-status";

export default function TransactionPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  if (!id) return null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <TransactionStatus transactionId={id} />
    </div>
  );
}
