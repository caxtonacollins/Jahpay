#!/bin/bash

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
INTERVAL=300  # 5 minutes in seconds
RPC_URL="${RPC_URL:-http://localhost:8545}"
RAMP_AGGREGATOR="${RAMP_AGGREGATOR_ADDRESS:-0xA7800f93677723c1e3238ECd4bfDB2fa82DF4Fe0}"
FEE_COLLECTOR="${FEE_COLLECTOR_ADDRESS:-0x5c043e1D09495F04a9f33551c49CE244c8226C46}"

echo "Starting contract writer scheduler..."
echo "Interval: $((INTERVAL / 60)) minutes"
echo "RPC URL: $RPC_URL"
echo "RampAggregator: $RAMP_AGGREGATOR"
echo "FeeCollector: $FEE_COLLECTOR"
echo ""

write_to_contracts() {
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$TIMESTAMP] Writing to contracts..."

  # ============ RampAggregator Write Functions (Owner: 0x47915Cf5165227fB865cFb469C9EB406C793cCE2) ============
  
  # Check current fee and set a different one
  CURRENT_FEE=$(cast call "$RAMP_AGGREGATOR" "feeBps()" --rpc-url "$RPC_URL" 2>&1 | tail -1)
  NEW_FEE=$((100 + RANDOM % 100))
  
  # Only update if different
  if [ "$CURRENT_FEE" != "0x$(printf '%064x' $NEW_FEE)" ] && [ "$CURRENT_FEE" != "$NEW_FEE" ]; then
    echo "  → setFee (current: $CURRENT_FEE → new: $NEW_FEE bps)..."
    RESULT=$(cast send "$RAMP_AGGREGATOR" "setFee(uint256)" "$NEW_FEE" --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" 2>&1)
    if echo "$RESULT" | grep -qi "success"; then
      echo "    ✓ Success"
    else
      echo "    ✗ Failed"
    fi
  else
    echo "  → setFee (skipped - already set to $NEW_FEE bps)"
  fi
  
  # Check and update provider configs
  MIN_AMOUNT=$((100000000000000000 + RANDOM % 100000000000000000))
  MAX_AMOUNT=$((10000000000000000000 + RANDOM % 5000000000000000000))
  
  for PROVIDER in "yellowcard" "cashramp" "bitmama"; do
    # Check if provider is active
    PROVIDER_CONFIG=$(cast call "$RAMP_AGGREGATOR" "providers(string)" "$PROVIDER" --rpc-url "$RPC_URL" 2>&1)
    
    if echo "$PROVIDER_CONFIG" | grep -qi "error\|revert"; then
      echo "  → setProviderConfig ($PROVIDER - error reading config)..."
    else
      IS_ACTIVE=$(echo "$PROVIDER_CONFIG" | head -1 | cut -c1-2)
      
      if [ "$IS_ACTIVE" = "0x" ]; then
        IS_ACTIVE="1"
      fi
      
      echo "  → setProviderConfig ($PROVIDER - active: $IS_ACTIVE, updating limits)..."
      sleep 1  # Add delay to avoid rate limiting
      RESULT=$(cast send "$RAMP_AGGREGATOR" "setProviderConfig(string,bool,uint256,uint256,uint256)" $PROVIDER true "$MIN_AMOUNT" "$MAX_AMOUNT" "100" --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" 2>&1)
      if echo "$RESULT" | grep -qi "success"; then
        echo "    ✓ Success"
      else
        echo "    ✗ Failed ($(echo "$RESULT" | grep -i "error\|revert" | head -1))"
      fi
    fi
  done
  
  # Check current backend signer and update if different
  CURRENT_SIGNER=$(cast call "$RAMP_AGGREGATOR" "backendSigner()" --rpc-url "$RPC_URL" 2>&1 | tail -1)
  EXPECTED_SIGNER=$(echo "$PAUSER" | tr '[:lower:]' '[:upper:]')
  
  if [ "$CURRENT_SIGNER" != "$EXPECTED_SIGNER" ]; then
    echo "  → setBackendSigner (current: $CURRENT_SIGNER → new: $PAUSER)..."
    RESULT=$(cast send "$RAMP_AGGREGATOR" "setBackendSigner(address)" "$PAUSER" --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" 2>&1)
    if echo "$RESULT" | grep -qi "success"; then
      echo "    ✓ Success"
    else
      echo "    ✗ Failed"
    fi
  else
    echo "  → setBackendSigner (skipped - already set to $PAUSER)"
  fi
  
  # Check pause state and toggle if needed
  IS_PAUSED=$(cast call "$RAMP_AGGREGATOR" "paused()" --rpc-url "$RPC_URL" 2>&1 | tail -1)
  
  if [ "$IS_PAUSED" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "  → pause (currently unpaused)..."
    RESULT=$(cast send "$RAMP_AGGREGATOR" "pause()" --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" 2>&1)
    if echo "$RESULT" | grep -qi "success"; then
      echo "    ✓ Success"
    else
      echo "    ✗ Failed"
    fi
  else
    echo "  → unpause (currently paused)..."
    RESULT=$(cast send "$RAMP_AGGREGATOR" "unpause()" --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" 2>&1)
    if echo "$RESULT" | grep -qi "success"; then
      echo "    ✓ Success"
    else
      echo "    ✗ Failed"
    fi
  fi

  echo "✓ Write operations completed"
  echo ""
}

# Run immediately on start
write_to_contracts

# Then run every 5 minutes
while true; do
  sleep "$INTERVAL"
  write_to_contracts
done
