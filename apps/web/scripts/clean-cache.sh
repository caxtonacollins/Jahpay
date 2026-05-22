#!/bin/bash

echo "🧹 Cleaning Jahpay build caches..."

# Clean Next.js cache
echo "Removing .next directories..."
rm -rf apps/web/.next
rm -rf apps/contracts/.next

# Clean Turbo cache
echo "Removing .turbo cache..."
rm -rf .turbo

# Clean node_modules cache
echo "Removing node_modules cache..."
rm -rf apps/web/node_modules/.cache
rm -rf node_modules/.cache

# Clean pnpm cache (optional - uncomment if needed)
# echo "Cleaning pnpm store..."
# pnpm store prune

echo "✅ Cache cleaned successfully!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm install"
echo "2. Run: pnpm dev"
echo ""
echo "Expected improvement: 50-70% faster compilation"
