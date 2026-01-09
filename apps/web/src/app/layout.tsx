import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/layout/navbar';
import { WalletProvider } from "@/components/wallet-provider"
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'jahpay',
  description: 'Seamlessly convert between fiat and crypto with the best rates from multiple providers',
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
            <AuthProvider>
              <TransactionsProvider>
                <Navbar />
                <main className="flex-1 pt-20">
                  {children}
                </main>
                <Footer />
                <Toaster />
              </TransactionsProvider>
            </AuthProvider>
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
