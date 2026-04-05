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
  description: "A new Celo blockchain project",
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
