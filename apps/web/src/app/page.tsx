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
  Code,
  Users,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import type { Variants } from "framer-motion";

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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      duration: 0.8,
    },
  },
};

const providers = [
  { name: "Yellow Card", icon: "🟡", description: "20+ African countries" },
  { name: "Cashramp", icon: "🔷", description: "Fast & reliable" },
  { name: "Bitmama", icon: "🟣", description: "Multi-currency support" },
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
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Bank-to-Wallet",
    description:
      "Direct on-ramps from bank transfers and mobile money. Off-ramps to any Nigerian bank account.",
    icon: Smartphone,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Secure & Audited",
    description:
      "Production-grade smart contracts with comprehensive security audits and 99.5% uptime guarantee.",
    icon: Lock,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Low Fees",
    description:
      "Competitive platform fees starting at just 1.5% with no hidden charges or surprise costs.",
    icon: TrendingUp,
    color: "from-indigo-500 to-blue-500",
  },
  {
    title: "Real-time Tracking",
    description:
      "Monitor every transaction in real-time with detailed status updates and transaction history.",
    icon: BarChart3,
    color: "from-rose-500 to-red-500",
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
  const [activeTab, setActiveTab] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(0);

  return (
    <main className="flex-1">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/20"
          style={{ backgroundSize: "400% 400%" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.1))]" />
        </div>

        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-purple-500/20 to-transparent blur-3xl" />
        </div>

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="text-center max-w-6xl mx-auto pt-24 md:pt-32"
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 rounded-full border border-blue-500/30 backdrop-blur-sm hover:border-blue-500/50 transition-all group">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <Zap className="h-4 w-4 text-yellow-300" />
                </motion.span>
                <span className="group-hover:text-white transition-colors">Built on Celo • Production-Grade dApp</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={item} className="relative">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 leading-tight"
              >
                <div className="flex items-center justify-center">
                  <motion.span
                    className="inline-block relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-200 to-blue-500 whitespace-nowrap">
                      Fiat
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-md" />
                  </motion.span>

                  <motion.div
                    className="relative h-12 w-12 md:h-14 md:w-14 mx-2 md:mx-3 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-md" />

                    {/* Main circle */}
                    <div className="relative z-10 h-12 w-12 md:h-14 md:w-14 rounded-full 
                             bg-gradient-to-br from-blue-500/30 to-cyan-500/30 
                             border border-blue-400/30 
                             flex items-center justify-center 
                             backdrop-blur-sm">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 md:h-8 md:w-8 text-blue-300"
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
                            x: [-2, 2, -2]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
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
                            x: [2, -2, 2]
                          }}
                          transition={{
                            duration: 3,
                            delay: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse"
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
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 whitespace-nowrap">
                      Crypto
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-md" />
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
                <span className="text-white font-semibold">
                  {" "}
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
              <Button
                size="lg"
                className="relative overflow-hidden group px-8 py-6 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                disabled
              >
                <span className="relative z-10 flex items-center">
                  Launch App
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white hover:text-white backdrop-blur-sm transition-all"
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

          {/* Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative group">
              {/* Glassmorphic Card */}
              <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-2xl p-8 backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative space-y-6">
                  {/* Mock Swap Interface */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Send */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-300">
                        From
                      </label>
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-2xl font-bold text-white">
                            2,500
                          </span>
                          <span className="text-sm px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                            NGN
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Nigerian Naira
                        </div>
                      </div>
                    </div>

                    {/* Receive */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-300">
                        To
                      </label>
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-2xl font-bold text-white">
                            1.70
                          </span>
                          <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                            cUSD
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Celo Stablecoin
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Rate</span>
                      <span className="text-white font-semibold">
                        1 USD = 1,470 NGN
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Platform Fee</span>
                      <span className="text-white font-semibold">
                        1.5% (~₦37.50)
                      </span>
                    </div>
                    <div className="h-px bg-slate-700/30" />
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">
                        You receive
                      </span>
                      <span className="text-emerald-400 font-bold">
                        1.70 cUSD
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 font-semibold">
                    Confirm Swap
                  </Button>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10 group-hover:blur-2xl transition-all duration-500" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-1/3 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 rounded-full border border-blue-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Features
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-300/90 max-w-2xl mx-auto">
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
              const gradient = feature.color.split(' ')[1]; // Extract gradient class

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="group relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-lg overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-blue-500/10">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500`}></div>

                    <div className="relative">
                      <motion.div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6 transform transition-transform duration-300 group-hover:scale-110`}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>

                      <h3 className="text-xl font-bold mb-3 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-slate-300/90 leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      <div className="flex items-center text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                        <span>Learn more</span>
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="mt-20 pt-12 border-t border-slate-800/50"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0, 0, 0, 0) 70%)" />
        </div>

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300 rounded-full border border-cyan-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              How It Works
            </h2>
            <p className="text-lg text-slate-300/90 max-w-2xl mx-auto">
              Complete your first fiat-to-crypto swap in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Animated connection line */}
            <motion.div
              className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <div className="absolute h-full w-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
            </motion.div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const colors = [
                "from-cyan-500 to-blue-500",
                "from-blue-500 to-indigo-500",
                "from-indigo-500 to-purple-500",
                "from-purple-500 to-pink-500"
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
                    stiffness: 100
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative group"
                >
                  {/* Step number with gradient ring */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center z-10">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <span className="relative z-10 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-300">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="relative h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-2xl p-6 pt-10 backdrop-blur-lg transition-all duration-300 group-hover:border-slate-600/50 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors} mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <div className="text-left">
                        <h3 className="text-xl font-bold mb-2 text-white">
                          {step.title}
                        </h3>
                        <p className="text-slate-300/90 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Ready to get started?
            </h3>
            <p className="text-lg text-slate-300/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users enjoying seamless fiat-to-crypto conversions today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="relative overflow-hidden group px-8 py-6 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white hover:text-white backdrop-blur-sm transition-all"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-900/30 to-transparent">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 rounded-full border border-purple-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Partners
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Trusted Providers
            </h2>
            <p className="text-lg text-slate-300/90 max-w-2xl mx-auto">
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
              const colors = [
                "from-purple-500 to-blue-500",
                "from-blue-500 to-cyan-500",
                "from-cyan-500 to-emerald-500"
              ][idx % 3];

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="group relative h-full"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-2xl p-8 backdrop-blur-lg overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-purple-500/10">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-br ${colors} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}></div>

                    <div className="relative z-10 text-center h-full flex flex-col items-center">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors} flex items-center justify-center text-3xl mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                        {provider.icon}
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-white">
                        {provider.name}
                      </h3>
                      <p className="text-slate-300/90 mb-6 flex-grow">
                        {provider.description}
                      </p>

                      <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/50 to-cyan-500/20 my-4"></div>

                      <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors flex items-center">
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

      {/* FAQ Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-radial-gradient(circle, rgba(124, 58, 237, 0.03) 0%, rgba(0, 0, 0, 0) 70%)" />
        </div>

        <div className="container px-4 mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 rounded-full border border-indigo-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Support
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Frequently Asked
            </h2>
            <p className="text-lg text-slate-300/90 max-w-2xl mx-auto">
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
                <motion.div
                  key={idx}
                  variants={item}
                  className="group"
                >
                  <motion.button
                    onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                    className={`w-full text-left bg-gradient-to-br from-slate-800/30 to-slate-900/30 border ${isOpen ? 'border-blue-500/30' : 'border-slate-700/30 hover:border-slate-600/50'
                      } rounded-xl p-6 transition-all duration-300 backdrop-blur-lg`}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: isOpen ? 'none' : '0 10px 30px -10px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white pr-8">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-blue-500/10' : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                          } transition-colors`}
                      >
                        <ChevronDown className={`h-4 w-4 ${isOpen ? 'text-blue-400' : 'text-slate-400'
                          } transition-colors`} />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? 'auto' : 0,
                        opacity: isOpen ? 1 : 0,
                        marginTop: isOpen ? '1rem' : 0,
                        paddingTop: isOpen ? '1rem' : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-slate-700/30"
                    >
                      <p className="text-slate-300/90 leading-relaxed">
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
              <p className="text-slate-300/90 mb-6">
                Still have questions? Our support team is here to help.
              </p>
              <Button
                variant="outline"
                className="px-8 py-6 text-base font-medium border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white hover:text-white backdrop-blur-sm transition-all group"
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
        <div className="container px-4 mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/30 rounded-2xl p-12 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of users converting fiat to crypto seamlessly
                  across Africa.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all"
                    disabled
                  >
                    Launch App (Use navbar)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base font-semibold border-blue-500/30 hover:bg-blue-500/10 backdrop-blur-sm"
                  >
                    Explore Docs
                  </Button>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10 group-hover:blur-2xl transition-all duration-500" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}


// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Zap } from "lucide-react";

// export default function Home() {
//   return (
// <main className="flex-1">
//   {/* Hero Section */}
//   <section className="relative py-20 lg:py-32">
//     <div className="container px-4 mx-auto max-w-7xl">
//       <div className="text-center max-w-4xl mx-auto">
//         {/* Badge */}
//         <div
//           className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
//         >
//           <Zap className="h-4 w-4" />
//           Built on Celo
//         </div>

//         {/* Main Heading */}
//         <h1
//           className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
//         >
//           Welcome to{" "}
//           <span className="text-primary">jahpay</span>
//         </h1>

//         {/* Subtitle */}
//         <p
//           className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
//         >
//           Start building your decentralized application on Celo. Fast and secure blockchain for everyone.
//         </p>


//         {/* CTA Buttons */}
//         <div
//           className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
//         >
//           <Button size="lg" className="px-8 py-3 text-base font-medium">
//             Get Started
//           </Button>
//         </div>
//       </div>
//     </div>
//   </section>

// </main>
//   );
// }
