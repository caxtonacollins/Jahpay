"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

function WalletRedirectContent() {
  const [hasRedirected, setHasRedirected] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && !hasRedirected) {
      setHasRedirected(true);
      router.push("/app");
    }
  }, [isConnected, hasRedirected, router]);

  return null;
}

export function WalletRedirect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <WalletRedirectContent />;
}
