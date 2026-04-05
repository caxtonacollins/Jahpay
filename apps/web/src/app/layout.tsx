import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import { MiniPayProvider } from "@/contexts/minipay-context";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "jahpay",
  description:
    "A dual-mode Web3 app for Celo stablecoin transfers. Works as both a website with multi-wallet support and a MiniPay Mini App for seamless mobile payments.",
  verification: {
    other: {
      "taleantapp:project_verification":
        "abbab1750b2dfcffd187a0237f54de93ec08c154bf3addc0949d0087170ef785b16f8b3dd915cbe6c542d9d3b2826c87f1530790f361c7096b51cc4e8eb01f27",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <MiniPayProvider>
            <WalletProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </WalletProvider>
          </MiniPayProvider>
        </div>
      </body>
    </html>
  );
}
