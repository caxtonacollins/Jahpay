"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Globe,
  TrendingUp,
  Lock,
  Zap as Lightning,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  BarChart3,
  Users,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Variants } from "framer-motion";
import Image from "next/image";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const providers = [
  {
    name: "Yellow Card",
    icon: "/images/yellowcard1.png",
    description: "20+ African countries",
    color: "from-celo-gold to-yellow-600",
  },
  {
    name: "Cashramp",
    icon: "/images/cashramp.jpeg",
    description: "Fast & reliable",
    color: "from-celo-green to-emerald-700",
  },
  {
    name: "Bitmama",
    icon: "/images/bitmama.png",
    description: "Multi-currency support",
    color: "from-blue-500 to-cyan-500",
  },
];

const features = [
  {
    title: "Multi-Provider Ramp",
    description:
      "Seamless integration with Yellow Card, Cashramp, and Bitmama for optimal rates and availability.",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Instant Conversions",
    description:
      "Convert between fiat and crypto in minutes with real-time exchange rates and transparent fees.",
    icon: Lightning,
    color: "from-celo-gold to-yellow-500",
  },
  {
    title: "Bank-to-Wallet",
    description:
      "Direct on-ramps from bank transfers and mobile money. Off-ramps to any Nigerian bank account.",
    icon: Smartphone,
    color: "from-celo-green to-emerald-500",
  },
  {
    title: "Secure & Audited",
    description:
      "Production-grade smart contracts with comprehensive security audits and 99.5% uptime guarantee.",
    icon: Lock,
    color: "from-teal-500 to-cyan-500",
  },
  {
    title: "Low Fees",
    description:
      "Competitive platform fees starting at just 1.5% with no hidden charges or surprise costs.",
    icon: TrendingUp,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Real-time Tracking",
    description:
      "Monitor every transaction in real-time with detailed status updates and transaction history.",
    icon: BarChart3,
    color: "from-celo-green to-teal-500",
  },
];

const steps = [
  {
    number: "1",
    title: "Connect Wallet",
    description: "Link your Celo wallet securely using Composer Kit",
    icon: Users,
  },
  {
    number: "2",
    title: "Select Provider",
    description: "Choose the best provider based on rate, speed, and fees",
    icon: Globe,
  },
  {
    number: "3",
    title: "Enter Details",
    description:
      "Specify amount and choose between bank transfer or mobile money",
    icon: Smartphone,
  },
  {
    number: "4",
    title: "Complete Transaction",
    description: "Confirm details and receive crypto instantly or send to bank",
    icon: CheckCircle2,
  },
];

const stats = [
  { value: "20+", label: "African Countries" },
  { value: "3", label: "Major Providers" },
  { value: "< 5min", label: "Average Settlement" },
  { value: "99.5%", label: "Uptime" },
];

const faqs = [
  {
    question: "What is the minimum transaction amount?",
    answer:
      "Minimum amounts vary by country and provider. For Nigeria, it's typically ₦1,000 ($1 USD). Maximum limits depend on your KYC verification level.",
  },
  {
    question: "How long does a transaction take?",
    answer:
      "Most transactions complete within 2-5 minutes depending on the provider and payment method. Bank transfers may take slightly longer (5-30 minutes).",
  },
  {
    question: "Which networks are supported?",
    answer:
      "We currently support Celo Mainnet and Alfajores Testnet. Multi-chain support for Ethereum, Polygon, and BSC is coming soon.",
  },
  {
    question: "How are my funds secured?",
    answer:
      "All smart contracts have undergone professional audits. We use ReentrancyGuard, multi-sig approvals, and 24/7 monitoring. Your private keys never leave your wallet.",
  },
  {
    question: "Do I need KYC verification?",
    answer:
      "Basic transactions don't require KYC. However, higher limits (>$100) require verification through our partner providers.",
  },
  {
    question: "What are the fees?",
    answer:
      "Platform fees start at 1.5%. Provider fees vary (1.5%-2.5%). No hidden charges. All fees are shown before you confirm.",
  },
];

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  return (
    <main className="flex-1 jahpay-bg jahpay-grid">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-hero" />

        <div className="container px-4 mx-auto max-w-7xl relative z-10 pt-16">
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="text-center max-w-6xl mx-auto pt-24 md:pt-32"
          >
            {/* Main Heading */}
            <motion.div variants={item} className="relative">
              <motion.h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 leading-tight">
                <div className="flex items-center justify-center">
                  <motion.span
                    className="inline-block relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-celo-green to-emerald-400 whitespace-nowrap">
                      Fiat
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-celo-green/30 to-emerald-500/30 blur-md" />
                  </motion.span>

                  <motion.div
                    className="relative h-12 w-12 md:h-14 md:w-14 mx-2 md:mx-3 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-celo-green/20 to-celo-gold/20 blur-md" />

                    {/* Main circle */}
                    <div
                      className="relative z-10 h-12 w-12 md:h-14 md:w-14 rounded-full 
                             bg-gradient-to-br from-celo-green/30 to-celo-gold/30 
                             border border-celo-green/30 
                             flex items-center justify-center 
                             backdrop-blur-sm"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 md:h-8 md:w-8 text-celo-gold"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {/* Right arrow */}
                        <motion.path
                          d="M4 12h16M14 6l6 6-6 6"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: 1,
                            opacity: 1,
                            x: [-2, 2, -2],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Left arrow */}
                        <motion.path
                          d="M10 12l-6 6 6 6"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: 1,
                            opacity: 1,
                            x: [2, -2, 2],
                          }}
                          transition={{
                            duration: 3,
                            delay: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.span
                    className="inline-block relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-celo-gold to-orange-400 whitespace-nowrap">
                      Crypto
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-celo-gold/30 to-orange-500/30 blur-md" />
                  </motion.span>
                </div>

                <motion.div
                  className="mt-6 md:mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <span className="text-3xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold tracking-normal">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                      Made Seamless
                    </span>
                  </span>
                </motion.div>
              </motion.h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="text-lg md:text-xl text-slate-300/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Convert between your local currency and Celo in minutes with the
                best rates across 20+ African countries.
                <span className="text-white font-semibold flex items-center justify-center mt-2 group">
                  <Globe className="w-5 h-5 mr-2 text-celo-green group-hover:text-celo-gold animate-pulse" />
                  Multi-provider ramp aggregator for everyone.
                </span>
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Link href="/app">
                <Button
                  size="lg"
                  className="relative overflow-hidden group px-8 py-6 text-base font-semibold bg-gradient-to-r from-celo-green to-emerald-500 hover:from-celo-green hover:to-emerald-400 shadow-lg hover:shadow-xl glow-green-sm transition-all transform hover:-translate-y-0.5 text-black"
                >
                  <span className="relative z-10 flex items-center">
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white hover:text-white backdrop-blur-sm transition-all"
                onClick={() => {
                  const element = document.getElementById("learn-more-section");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats Highlight */}
            <motion.div
              variants={item}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-700/50"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image Mockup (Redesigned colors) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative group">
              {/* Glassmorphic Card */}
              <div className="relative bg-gradient-to-br from-[#0d111c]/80 to-[#060b14]/80 border border-white/[0.06] rounded-2xl p-8 backdrop-blur-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-celo-green/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-celo-green/5 via-transparent to-celo-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative space-y-6">
                  {/* Mock Swap Interface */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Send */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                        You Send
                      </label>
                      <div className="bg-[#111624] border border-white/[0.04] rounded-xl p-4 space-y-2 relative overflow-hidden group-hover:border-celo-green/20 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold text-white tracking-tight">
                            2,500
                          </span>
                          <span className="text-sm px-3 py-1.5 bg-[#1a2133] text-white font-medium rounded-full flex items-center gap-1.5">
                            🇳🇬 NGN
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Balance: 145,000 NGN
                        </div>
                      </div>
                    </div>

                    {/* Receive */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                        You Receive
                      </label>
                      <div className="bg-[#111624] border border-white/[0.04] rounded-xl p-4 space-y-2 relative overflow-hidden group-hover:border-celo-green/20 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold text-white tracking-tight">
                            1.70
                          </span>
                          <span className="text-sm px-3 py-1.5 bg-[#1a2133] text-white font-medium rounded-full flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-celo-green flex items-center justify-center text-[8px] font-bold text-black leading-none">cU</span>
                            cUSD
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Balance: 0.00 cUSD
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-transparent rounded-lg p-2 space-y-2 border-t border-white/[0.06] pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Rate</span>
                      <span className="text-white font-medium">
                        1 cUSD = 1,470 NGN
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Lightning className="w-3.5 h-3.5 text-celo-gold" />
                        Network Fee
                      </span>
                      <span className="text-white font-medium">
                        ~₦37.50
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Button className="w-full bg-gradient-to-r from-celo-green to-emerald-500 hover:from-celo-green hover:to-emerald-400 py-6 text-lg font-bold text-black rounded-xl">
                    Swap NGN → cUSD
                  </Button>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-celo-green/20 to-celo-gold/20 rounded-2xl blur-3xl -z-10 group-hover:blur-2xl transition-all duration-500" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-features" />

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-celo-green/10 to-celo-gold/10 text-celo-green rounded-full border border-celo-green/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Features
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need for seamless fiat-to-crypto conversions
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const gradient = feature.color.split(" ")[1]; // Extract gradient class

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="group relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-full border border-white/[0.06] bg-[#0d111c]/60 rounded-2xl p-6 backdrop-blur-lg overflow-hidden transition-all duration-300 hover:border-celo-green/30 hover:shadow-2xl hover:shadow-celo-green/10">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-celo-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative">
                      <motion.div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6 transform transition-transform duration-300 group-hover:scale-110 shadow-lg`}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-6 w-6 text-black" />
                      </motion.div>

                      <h3 className="text-xl font-bold mb-3 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="mt-20 pt-12 border-t border-white/[0.04]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-celo-green to-emerald-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-howit" />

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-celo-gold/10 to-yellow-500/10 text-celo-gold rounded-full border border-celo-gold/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Complete your first fiat-to-crypto swap in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Animated connection line */}
            <motion.div
              className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-celo-green/20 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <div className="absolute h-full w-1/2 bg-gradient-to-r from-celo-green to-celo-gold animate-pulse" />
            </motion.div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const colors = [
                "from-celo-green to-emerald-500",
                "from-emerald-500 to-teal-500",
                "from-teal-500 to-cyan-500",
                "from-cyan-500 to-blue-500",
              ][idx % 4];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative group"
                >
                  {/* Step number with gradient ring */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#060b14] border-2 border-white/[0.08] flex items-center justify-center z-10 group-hover:border-celo-green/30 transition-colors">
                    <span className="relative z-10 text-lg font-bold text-white">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="relative h-full bg-[#0d111c]/80 border border-white/[0.06] rounded-2xl p-6 pt-10 backdrop-blur-lg transition-all duration-300 group-hover:border-celo-green/20 group-hover:shadow-2xl hover:shadow-celo-green/5">
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    ></div>

                    <div className="relative z-10 text-center">
                      <div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors} mb-6 transform transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6 text-black" />
                      </div>

                      <h3 className="text-xl font-bold mb-2 text-white">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Testimonial Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
         {/* Section overlay implicitly merges with grid */}
        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img
                  src="/images/banner.png"
                  alt="Smiling user with Jahpay"
                  className="rounded-2xl shadow-2xl relative z-10 border border-white/[0.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-celo-green/20 to-celo-gold/20 blur-3xl -z-10 rounded-full mix-blend-screen opacity-50" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                From Local Currency to Crypto, All in Your Hands
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Jahpay puts the power of seamless digital finance right in your
                pocket. With a user-friendly interface, you can effortlessly
                navigate the world of crypto, making transactions as simple as
                sending a text message. Experience the joy of financial freedom
                with a platform designed for you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-providers" />

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-celo-green/10 to-celo-gold/10 text-celo-green rounded-full border border-celo-green/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Partners
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Trusted Providers
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Multi-provider aggregator ensures best rates and maximum availability
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {providers.map((provider, idx) => {
              const colors = provider.color;

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="group relative h-full"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-full border border-white/[0.06] bg-[#0d111c]/60 rounded-2xl p-8 backdrop-blur-lg overflow-hidden transition-all duration-300 hover:border-white/[0.1] hover:shadow-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                    <div
                      className={`absolute -inset-1 bg-gradient-to-br ${colors} rounded-2xl opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                    ></div>

                    <div className="relative z-10 text-center h-full flex flex-col items-center">
                      <div className="relative w-20 h-20 mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl rounded-xl overflow-hidden bg-[#111624] p-2 border border-white/[0.05]">
                        <Image
                          src={provider.icon}
                          alt={provider.name}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full rounded-lg"
                          priority
                        />
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-white">
                        {provider.name}
                      </h3>
                      <p className="text-slate-400 mb-6 flex-grow">
                        {provider.description}
                      </p>

                      <div className="w-8 h-px bg-white/20 my-4" />

                      <div className="text-sm font-medium text-celo-green group-hover:text-emerald-400 transition-colors flex items-center">
                        <span>Learn more</span>
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Learn More / Choose Jahpay Section */}
      <section
        id="learn-more-section"
        className="relative py-20 lg:py-32 overflow-hidden"
      >
        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 rounded-full border border-blue-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Learn More
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Why Choose Jahpay?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Discover what makes jahpay the best choice for fiat-to-crypto
              conversions
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {[
              {
                title: "Best Rates Guaranteed",
                description:
                  "Our multi-provider aggregator compares rates to ensure you always get the best deal. No hidden markups.",
                icon: TrendingUp,
                colors: "from-celo-green to-emerald-500",
              },
              {
                title: "Lightning Fast",
                description:
                  "Most transactions complete in under 5 minutes. Real-time rate updates and instant confirmations keep you in control.",
                icon: Zap,
                colors: "from-celo-gold to-yellow-500",
              },
              {
                title: "Secure & Audited",
                description:
                  "All smart contracts have undergone professional security audits. Your funds are protected with multi-sig wallets and 24/7 monitoring.",
                icon: Lock,
                colors: "from-blue-500 to-cyan-500",
              },
              {
                title: "20+ African Countries",
                description:
                  "Support for NGN, GHS, KES, ZAR, and more. Send and receive from any African country with local payment methods.",
                icon: Globe,
                colors: "from-teal-500 to-emerald-500",
              },
            ].map((learnItem, idx) => {
              const Icon = learnItem.icon;
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="group relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-full bg-[#0d111c]/60 border border-white/[0.06] rounded-2xl p-8 backdrop-blur-lg overflow-hidden transition-all duration-300 hover:border-white/[0.1] hover:shadow-xl hover:shadow-celo-green/5">
                    <div className="relative">
                      <motion.div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${learnItem.colors} mb-6 transform transition-transform duration-300 group-hover:scale-110`}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-6 w-6 text-black" />
                      </motion.div>

                      <h3 className="text-xl font-bold mb-3 text-white">
                        {learnItem.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {learnItem.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-faq" />

        <div className="container px-4 mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-white/[0.05] text-slate-300 rounded-full border border-white/[0.1] backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Support
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Frequently Asked
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to know about using our platform
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <motion.div key={idx} variants={item} className="group">
                  <motion.button
                    onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                    className={`w-full text-left bg-[#0d111c]/60 border ${
                      isOpen
                        ? "border-celo-green/30"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    } rounded-xl p-6 transition-all duration-300 backdrop-blur-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white pr-8">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isOpen
                            ? "bg-celo-green/10"
                            : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                        } transition-colors`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 ${
                            isOpen ? "text-celo-green" : "text-slate-400"
                          } transition-colors`}
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0,
                        marginTop: isOpen ? "1rem" : 0,
                        paddingTop: isOpen ? "1rem" : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-white/[0.06]"
                    >
                      <p className="text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </motion.button>
                </motion.div>
              );
            })}

            {/* Support CTA */}
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 mb-6">
                Still have questions? Our support team is here to help.
              </p>
              <Button
                variant="outline"
                className="px-8 py-6 text-base font-medium border-white/[0.1] bg-[#0d111c]/80 hover:bg-[#151b2b] text-white hover:text-white backdrop-blur-sm transition-all group"
              >
                <span className="flex items-center">
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Section specific overlay over the grid */}
        <div className="absolute inset-0 -z-10 section-overlay-cta" />

        <div className="container px-4 mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="relative border border-white/[0.08] bg-[#0d111c]/80 rounded-2xl p-12 backdrop-blur-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-celo-green/5 via-transparent to-celo-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of users converting fiat to crypto seamlessly
                  across Africa.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/app">
                    <Button
                      size="lg"
                      className="px-8 py-6 text-base font-bold bg-gradient-to-r from-celo-green to-emerald-500 hover:from-celo-green hover:to-emerald-400 shadow-lg hover:shadow-xl text-black transition-all glow-green-sm"
                    >
                      Launch App
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base font-semibold border-white/[0.1] hover:bg-white/[0.05] text-white backdrop-blur-sm"
                  >
                    Explore Docs
                  </Button>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-celo-green/10 to-celo-gold/10 rounded-2xl blur-3xl -z-10 group-hover:blur-2xl transition-all duration-500" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
