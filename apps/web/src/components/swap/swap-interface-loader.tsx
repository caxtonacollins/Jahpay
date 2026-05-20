"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function SwapWidgetSkeleton() {
  return (
    <div className="w-full max-w-[420px] mx-auto rounded-2xl border border-white/[0.08] bg-[#0d111c]/80 p-6 min-h-[320px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
        <span className="text-sm">Loading swap widget...</span>
      </div>
    </div>
  );
}

export const SwapInterface = dynamic(
  () => import("./swap-interface").then((m) => m.SwapInterface),
  {
    ssr: false,
    loading: () => <SwapWidgetSkeleton />,
  },
);
