import Link from 'next/link';
import { SiteConfig } from '@/config/site';
import { Twitter, Github, Mail } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Image
              src="/images/logo.png"
              alt="jahpay logo"
              width={150}
              height={40}
              className="rounded-lg"
              priority
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Seamless fiat to crypto conversions with the best rates and lowest fees.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href={SiteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={SiteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@jahpay.app"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Product</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/buy"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Buy Crypto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sell"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Sell Crypto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Support</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {SiteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
