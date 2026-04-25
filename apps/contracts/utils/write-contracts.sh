#!/bin/bash

# Load environment variables
set -a
source "$(dirname "$0")/../.env"
set +a

# Configuration
INTERVAL=20  # 20 seconds
RPC_URL="${RPC_URL:-http://localhost:8545}"
RAMP_AGGREGATOR="${RAMP_AGGREGATOR_ADDRESS:-0xA7800f93677723c1e3238ECd4bfDB2fa82DF4Fe0}"
FEE_COLLECTOR="${FEE_COLLECTOR_ADDRESS:-0x5c043e1D09495F04a9f33551c49CE244c8226C46}"

echo "Starting contract writer scheduler..."
echo "Interval: $INTERVAL seconds"
echo "RPC URL: $RPC_URL"
echo "RampAggregator: $RAMP_AGGREGATOR"
echo "FeeCollector: $FEE_COLLECTOR"
echo ""

write_to_contracts() {
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$TIMESTAMP] Writing to contracts..."

  # ============ RampAggregator setFee Function ============
  
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
