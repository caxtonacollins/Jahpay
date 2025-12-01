"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  gradient = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative bg-gradient-to-br from-slate-800/40 to-slate-900/40",
        "border border-slate-700/30 rounded-xl backdrop-blur-sm",
        "transition-all duration-300",
        hover &&
          "hover:border-slate-600/50 hover:shadow-xl hover:shadow-slate-900/50",
        gradient && "bg-gradient-to-br from-blue-600/20 to-purple-600/20",
        className
      )}
    >
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
