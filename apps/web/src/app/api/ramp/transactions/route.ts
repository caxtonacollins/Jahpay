import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Get user transaction history
 * GET /api/ramp/transactions
 */
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // In production, fetch from database with filters

    const mockTransactions = [
      {
        id: "tx_1",
        type: "on-ramp",
        provider: "yellowcard",
        status: "completed",
        crypto_amount: 10.5,
        crypto_currency: "cUSD",
        fiat_amount: 15000,
        fiat_currency: "NGN",
        exchange_rate: 1428.57,
        platform_fee: 225,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "tx_2",
        type: "off-ramp",
        provider: "cashramp",
        status: "processing",
        crypto_amount: 5.0,
        crypto_currency: "cEUR",
        fiat_amount: 5500,
        fiat_currency: "NGN",
        exchange_rate: 1100,
        platform_fee: 110,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return NextResponse.json({
      transactions: mockTransactions,
      total: mockTransactions.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
