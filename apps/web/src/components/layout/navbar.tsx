"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/connect-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingDown = currentScrollPos > prevScrollPos;

      // Always show navbar when scrolling to the top of the page
      if (currentScrollPos < 10) {
        setVisible(true);
        setPrevScrollPos(currentScrollPos);
        return;
      }

      // Only set the navbar to visible if user is scrolling up
      setVisible(!isScrollingDown);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full bg-transparent transition-transform duration-300 ease-in-out",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
      style={{
        background: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div className="container flex h-20 items-center justify-between px-6 md:px-8">
        {/* Left side - Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/logo_name.png"
            alt="jahpay logo"
            width={120}
            height={20}
            className="rounded-lg"
          />
        </Link>

        {/* Right side - Desktop nav and mobile menu button */}
        <div className="flex items-center gap-4">
          {/* Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/transactions"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/transactions" ? "text-white" : "text-gray-400",
              )}
            >
              Transactions
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="gradient"
                size="icon"
                className="md:hidden text-white hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 bg-[#0A0E17] border-r border-gray-800"
            >
              <div className="flex flex-col h-full px-4 py-6">
                <div className="flex items-center justify-start gap-3 mb-8">
                  <Image
                    src="/images/logo_name.png"
                    alt="jahpay logo"
                    width={200}
                    height={20}
                    className="rounded-lg"
                    priority
                  />
                </div>
                <nav className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-800">
                  <Link
                    href="/transactions"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white py-2",
                      pathname === "/transactions"
                        ? "text-white"
                        : "text-gray-400",
                    )}
                  >
                    Transactions
                  </Link>
                </nav>
                <div className="mt-auto pt-6">
                  <WalletConnectButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <div className="flex items-center gap-4">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
