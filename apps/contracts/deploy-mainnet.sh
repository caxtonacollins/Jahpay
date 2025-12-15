#!/bin/bash

# Jahpays Deployment Script for Celo Mainnet
# ⚠️  WARNING: This deploys to PRODUCTION - use real funds carefully!

set -e  # Exit on error

echo "🚀 Deploying Jahpays to Celo Mainnet..."
echo ""
echo "⚠️  WARNING: You are deploying to MAINNET!"
echo "⚠️  This will use REAL funds. Make sure you have:"
echo "   - Sufficient CELO for gas fees"
echo "   - Verified your contract code"
echo "   - Tested on testnet first"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "  PRIVATE_KEY=your_private_key"
    echo "  DEFAULT_ADMIN=0x... (address with admin privileges)"
    echo "  PAUSER=0x... (address with pauser privileges)"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$DEFAULT_ADMIN" ]; then
    echo "❌ Error: DEFAULT_ADMIN not set in .env file"
    exit 1
fi

if [ -z "$PAUSER" ]; then
    echo "❌ Error: PAUSER not set in .env file"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "  Network: Celo Mainnet"
echo "  RPC: https://forno.celo.org"
echo "  Default Admin: $DEFAULT_ADMIN"
echo "  Pauser: $PAUSER"
echo ""

# Run the deployment script
echo "🔨 Compiling contracts..."
forge build

echo ""
echo "📤 Deploying contracts to MAINNET..."
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv \


echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Contract addresses have been saved to .env file"
echo ""
echo "🔍 Next steps:"
echo "   1. Verify the contracts on CeloScan"
echo "   2. Test the deployment with a small transaction"
echo "   3. Update your frontend with the new contract addresses"
