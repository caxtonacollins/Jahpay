"use client";

import { UnifiedInterface } from "@/components/main-app/unified-interface";

export default function AppPage() {
  return (
    <main className="flex-1 jahpay-bg jahpay-grid">
      {/* Section overlay */}
      <div className="absolute inset-0 -z-10 section-overlay-hero" />
      <UnifiedInterface />
    </main>
  );
}
