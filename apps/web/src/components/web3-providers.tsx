"use client";

/**
 * Web3 providers — only loaded on the client (via dynamic ssr:false).
 * Keeps WalletConnect / indexedDB off the server.
 */

import { type ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { defineChain } from "viem";
import { http } from "wagmi";
import { AuthProvider } from "@/contexts/auth-context";

const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Blockscout",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
});

const customDarkTheme = darkTheme({
  accentColor: "#7b3fe4",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

const config = getDefaultConfig({
  appName: "jahpay",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    "5e89c4eefe79b7c5cfd8c43f6826e9da",
  chains: [celo, celoAlfajores, celoSepolia],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
    [celoSepolia.id]: http(),
  },
  ssr: true,
});

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={customDarkTheme}>
        <AuthProvider>{children}</AuthProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
