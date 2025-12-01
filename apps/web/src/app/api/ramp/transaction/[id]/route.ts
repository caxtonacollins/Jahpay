import { NextRequest, NextResponse } from "next/server";

/**
 * Get transaction by ID
 * GET /api/ramp/transaction/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch from database
    // Verify that the transaction belongs to the user

    const mockTransaction = {
      id,
      user_id: "user_123",
      type: "on-ramp",
      provider: "yellowcard",
      status: "completed",
      crypto_amount: 10.5,
      crypto_currency: "cUSD",
      wallet_address: walletAddress,
      blockchain_tx_hash: "0x...",
      fiat_amount: 15000,
      fiat_currency: "NGN",
      exchange_rate: 1428.57,
      platform_fee: 225,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(mockTransaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
