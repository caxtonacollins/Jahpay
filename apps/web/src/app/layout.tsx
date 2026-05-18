import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { TransactionsProvider } from "@/contexts/transactions-context";
import { FooterWrapper } from "@/components/layout/footer-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jahpay — USDC ↔ USDT Swap on Celo",
  description:
    "Swap USDC and USDT instantly on Celo with oracle-priced rates, 0.3% fee, and an ERC-8004 AI agent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
            <WalletProvider>
              <TransactionsProvider>
                <Navbar />
                <main className="flex-1 pt-20">{children}</main>
                <FooterWrapper />
                <Toaster />
              </TransactionsProvider>
            </WalletProvider>
        </div>
      </body>
    </html>
  );
}
