"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  gradient = false,
  glow = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative z-10 rounded-2xl overflow-visible",
        "bg-[#0d111c]/80 backdrop-blur-2xl",
        "border border-white/[0.06]",
        "transition-all duration-300",
        glow && "glow-blue border-brand-blue/20",
        hover &&
          !glow &&
          "hover:border-white/[0.12] hover:shadow-2xl hover:shadow-black/40",
        gradient && "bg-gradient-to-br from-brand-blue/10 to-brand-green/5",
        className,
      )}
    >
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
      {/* Inner glow when focused */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/[0.04] to-transparent pointer-events-none rounded-2xl" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
