#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Jahpay Build Optimization Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Clean caches
echo -e "${YELLOW}Step 1: Cleaning caches...${NC}"
rm -rf apps/web/.next
rm -rf apps/contracts/.next
rm -rf .turbo
rm -rf apps/web/node_modules/.cache
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Caches cleaned${NC}"
echo ""

# Step 2: Reinstall dependencies
echo -e "${YELLOW}Step 2: Reinstalling dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Type check
echo -e "${YELLOW}Step 3: Running type check...${NC}"
cd apps/web
pnpm type-check
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Type check passed${NC}"
else
  echo -e "${RED}✗ Type check failed${NC}"
  exit 1
fi
cd ../..
echo ""

# Step 4: Build
echo -e "${YELLOW}Step 4: Building application...${NC}"
echo -e "${BLUE}Measuring build time...${NC}"
time pnpm build
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi
echo ""

# Step 5: Show cache size
echo -e "${YELLOW}Step 5: Cache Analysis${NC}"
CACHE_SIZE=$(du -sh apps/web/.next/cache 2>/dev/null | cut -f1)
echo -e "${GREEN}✓ Cache size: $CACHE_SIZE${NC}"
echo ""

# Step 6: Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Optimization complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run: ${BLUE}pnpm dev${NC}"
echo -e "  2. Monitor: ${BLUE}./scripts/monitor-performance.sh${NC}"
echo -e "  3. Analyze: ${BLUE}ANALYZE=true pnpm build${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
