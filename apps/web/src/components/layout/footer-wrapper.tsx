"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Only show footer on landing page
  if (pathname !== "/") {
    return null;
  }

  return <Footer />;
}
