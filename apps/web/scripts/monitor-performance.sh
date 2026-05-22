#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Jahpay Performance Monitoring Dashboard${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to format bytes
format_bytes() {
  local bytes=$1
  if (( bytes < 1024 )); then
    echo "${bytes}B"
  elif (( bytes < 1024 * 1024 )); then
    echo "$((bytes / 1024))KB"
  elif (( bytes < 1024 * 1024 * 1024 )); then
    echo "$((bytes / 1024 / 1024))MB"
  else
    echo "$((bytes / 1024 / 1024 / 1024))GB"
  fi
}

# 1. Cache Size
echo -e "${YELLOW}📦 Cache Analysis${NC}"
CACHE_SIZE=$(du -sb apps/web/.next/cache 2>/dev/null | cut -f1)
if [ -z "$CACHE_SIZE" ]; then
  echo -e "${RED}  ✗ No cache found${NC}"
else
  CACHE_FORMATTED=$(format_bytes $CACHE_SIZE)
  if (( CACHE_SIZE > 1024 * 1024 * 1024 )); then
    echo -e "${RED}  ✗ Cache size: $CACHE_FORMATTED (TOO LARGE - run clean-cache.sh)${NC}"
  elif (( CACHE_SIZE > 500 * 1024 * 1024 )); then
    echo -e "${YELLOW}  ⚠ Cache size: $CACHE_FORMATTED (Consider cleaning)${NC}"
  else
    echo -e "${GREEN}  ✓ Cache size: $CACHE_FORMATTED (Optimal)${NC}"
  fi
fi
echo ""

# 2. Node Modules Size
echo -e "${YELLOW}📚 Dependencies${NC}"
MODULES_SIZE=$(du -sb apps/web/node_modules 2>/dev/null | cut -f1)
if [ -z "$MODULES_SIZE" ]; then
  echo -e "${RED}  ✗ node_modules not found${NC}"
else
  MODULES_FORMATTED=$(format_bytes $MODULES_SIZE)
  echo -e "${GREEN}  ✓ node_modules size: $MODULES_FORMATTED${NC}"
fi
echo ""

# 3. Source Code Size
echo -e "${YELLOW}📝 Source Code${NC}"
SRC_SIZE=$(du -sb apps/web/src 2>/dev/null | cut -f1)
SRC_FILES=$(find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
SRC_FORMATTED=$(format_bytes $SRC_SIZE)
echo -e "${GREEN}  ✓ Source size: $SRC_FORMATTED ($SRC_FILES files)${NC}"
echo ""

# 4. Build Output Size
echo -e "${YELLOW}🏗️  Build Output${NC}"
if [ -d "apps/web/.next/static" ]; then
  STATIC_SIZE=$(du -sb apps/web/.next/static 2>/dev/null | cut -f1)
  STATIC_FORMATTED=$(format_bytes $STATIC_SIZE)
  echo -e "${GREEN}  ✓ Static files: $STATIC_FORMATTED${NC}"
else
  echo -e "${YELLOW}  ⚠ No build output found (run 'pnpm build' first)${NC}"
fi
echo ""

# 5. Dependency Count
echo -e "${YELLOW}📦 Dependency Analysis${NC}"
PROD_DEPS=$(cd apps/web && pnpm list --depth=0 2>/dev/null | grep -c "^├\|^└" || echo "0")
DEV_DEPS=$(cd apps/web && pnpm list --depth=0 --dev 2>/dev/null | grep -c "^├\|^└" || echo "0")
echo -e "${GREEN}  ✓ Production dependencies: $PROD_DEPS${NC}"
echo -e "${GREEN}  ✓ Dev dependencies: $DEV_DEPS${NC}"
echo ""

# 6. TypeScript Files
echo -e "${YELLOW}🔍 TypeScript Analysis${NC}"
TS_FILES=$(find apps/web/src -name "*.ts" -o -name "*.tsx" | wc -l)
TS_LINES=$(find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo -e "${GREEN}  ✓ TypeScript files: $TS_FILES${NC}"
echo -e "${GREEN}  ✓ Lines of code: $TS_LINES${NC}"
echo ""

# 7. Recommendations
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}💡 Recommendations:${NC}"

if (( CACHE_SIZE > 1024 * 1024 * 1024 )); then
  echo -e "${RED}  1. Run './scripts/clean-cache.sh' to reduce cache size${NC}"
fi

if (( MODULES_SIZE > 1024 * 1024 * 1024 )); then
  echo -e "${YELLOW}  2. Consider removing unused dependencies${NC}"
fi

if (( TS_LINES > 10000 )); then
  echo -e "${YELLOW}  3. Consider splitting large components${NC}"
fi

echo -e "${GREEN}  ✓ Run 'pnpm dev' to start development server${NC}"
echo -e "${GREEN}  ✓ Run 'time pnpm build' to measure build time${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
