"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MiniPayContextType {
  isMiniPay: boolean;
  isLoading: boolean;
  userAddress: string | null;
}

const MiniPayContext = createContext<MiniPayContextType | undefined>(undefined);

export function MiniPayProvider({ children }: { children: React.ReactNode }) {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // Detect MiniPay
    const hasMiniPay = !!(
      window.ethereum && (window.ethereum as any).isMiniPay
    );
    setIsMiniPay(hasMiniPay);

    // Get user address if in MiniPay
    if (hasMiniPay) {
      (async () => {
        try {
          const accounts = await (window.ethereum as any).request({
            method: "eth_requestAccounts",
            params: [],
          });
          setUserAddress(accounts[0] || null);
        } catch (error) {
          console.error("Failed to get MiniPay address:", error);
        }
      })();
    }

    setIsLoading(false);
  }, []);

  return (
    <MiniPayContext.Provider value={{ isMiniPay, isLoading, userAddress }}>
      {children}
    </MiniPayContext.Provider>
  );
}

export function useMiniPayContext() {
  const context = useContext(MiniPayContext);
  if (context === undefined) {
    throw new Error("useMiniPayContext must be used within MiniPayProvider");
  }
  return context;
}
