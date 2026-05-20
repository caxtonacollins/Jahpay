const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly set turbopack root to avoid workspace detection issues
  turbopack: {
    root: path.join(__dirname, "../.."),
    resolveAlias: {
      'framer-motion': 'framer-motion',
      'lucide-react': 'lucide-react',
    },
  },
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Remove React.Fragment shorthand for smaller bundle
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  // Optimize on-demand entries
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Enable experimental features for faster builds
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
    ],
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
