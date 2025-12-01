"use client";

import { ReactNode } from "react";
import { cn } from "lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  via?: string;
}

export function GradientText({
  children,
  className,
  from = "from-blue-400",
  to = "to-cyan-500",
  via,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r text-transparent bg-clip-text",
        from,
        via,
        to,
        className
      )}
    >
      {children}
    </span>
  );
}
