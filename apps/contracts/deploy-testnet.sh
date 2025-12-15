#!/bin/bash

# Jahpays Deployment Script for Celo Alfajores Testnet

set -e  # Exit on error

echo "🚀 Deploying Jahpays to Celo Alfajores Testnet..."
echo ""
echo "🔍 This is a TEST deployment. No real funds will be used."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "  PRIVATE_KEY=your_testnet_private_key"
    echo "  DEFAULT_ADMIN=0x... (optional, defaults to deployer)"
    echo "  PAUSER=0x... (optional, defaults to deployer)"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

# Set default values if not provided
DEFAULT_ADMIN=${DEFAULT_ADMIN:-$(cast wallet address --private-key $PRIVATE_KEY)}
PAUSER=${PAUSER:-$DEFAULT_ADMIN}

echo "📋 Testnet Deployment Configuration:"
echo "  Network: Celo Alfajores Testnet"
echo "  RPC: https://forno.celo-sepolia.celo-testnet.org/"
echo "  Deployer: $(cast wallet address --private-key $PRIVATE_KEY)"
echo "  Default Admin: $DEFAULT_ADMIN"
echo "  Pauser: $PAUSER"
echo ""

# Run the testnet deployment script
echo "🔨 Compiling contracts..."
forge build

echo ""
echo "📤 Deploying contracts to Alfajores Testnet..."
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org/ \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv

echo ""
echo "✅ Testnet deployment complete!"
