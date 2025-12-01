import { NextRequest, NextResponse } from "next/server";

/**
 * Get user's saved bank accounts
 * GET /api/user/bank-accounts
 */
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch from database

    const mockAccounts = [
      {
        id: "ba_1",
        account_number: "1234567890",
        bank_code: "044",
        bank_name: "Access Bank Nigeria",
        account_name: "John Doe",
        country_code: "NG",
        is_verified: true,
        is_default: true,
        created_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      accounts: mockAccounts,
      total: mockAccounts.length,
    });
  } catch (error) {
    console.error("Get bank accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}

/**
 * Add a new bank account
 * POST /api/user/bank-accounts
 */
export async function POST(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { account_number, bank_code, account_name, country_code } =
      await req.json();

    // Validate input
    if (!account_number || !bank_code || !account_name || !country_code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Verify bank account
    // 2. Store in database
    // 3. Mark as verified

    const mockNewAccount = {
      id: `ba_${Date.now()}`,
      account_number,
      bank_code,
      account_name,
      country_code,
      is_verified: false, // Need to verify first
      is_default: false,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(mockNewAccount, { status: 201 });
  } catch (error) {
    console.error("Add bank account error:", error);
    return NextResponse.json(
      { error: "Failed to add bank account" },
      { status: 500 }
    );
  }
}
