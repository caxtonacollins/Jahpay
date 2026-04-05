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
  verification: {
    other: {
      "taleantapp:project_verification":
        "a8b0d175b802dfcf1d187a8237f54de03cc8c154d3add084d0a8d7f8ef785b0f8b3c9d1cbe6c5b42d03b28c8f1c538f98f",
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
