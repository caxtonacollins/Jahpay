"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  gradient?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
  iconClassName,
  gradient = "from-blue-500 to-cyan-500",
}: FeatureCardProps) {
  return (
    <div className={cn("group", className)}>
      <div className="relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

        <div className="relative">
          <div
            className={cn(
              `inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-4`,
              iconClassName
            )}
          >
            {icon}
          </div>

          <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
