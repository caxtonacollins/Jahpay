/**
 * Token Badge Component
 * Displays a token symbol with branded gradient background
 */

import { cn } from "@/lib/utils";

interface TokenBadgeProps {
  symbol: "USDC" | "USDT";
  size?: "sm" | "lg";
}

export function TokenBadge({ symbol, size = "lg" }: TokenBadgeProps) {
  const isUSDC = symbol === "USDC";
  const sz = size === "lg" ? "w-9 h-9 text-sm" : "w-6 h-6 text-[10px]";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        sz,
      )}
      style={{
        background: isUSDC
          ? "linear-gradient(135deg,#2775CA,#1a5fa8)"
          : "linear-gradient(135deg,#26A17B,#1a7a5a)",
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
