/**
 * Slippage Selector Component
 * Allows user to select slippage tolerance with AI recommendation indicator
 */

import { cn } from "@/lib/utils";

interface SlippageSelectorProps {
  value: number;
  onChange: (v: number) => void;
  aiRecommended?: number;
  options?: number[];
}

export function SlippageSelector({
  value,
  onChange,
  aiRecommended,
  options = [10, 50, 100],
}: SlippageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40">Slippage</span>
      <div className="flex gap-1">
        {options.map((bps) => (
          <button
            key={bps}
            onClick={() => onChange(bps)}
            className={cn(
              "px-2 py-1 rounded-lg text-xs font-medium transition-all",
              value === bps
                ? "bg-brand-blue text-white"
                : "bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white",
            )}
          >
            {bps / 100}%
            {aiRecommended === bps && (
              <span className="ml-1 text-[9px] text-yellow-400">AI</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
