"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export function WalletRedirect() {
  const [mounted, setMounted] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && !hasRedirected) {
      setHasRedirected(true);
      router.push("/app");
    }
  }, [mounted, isConnected, hasRedirected, router]);

  return null;
}
