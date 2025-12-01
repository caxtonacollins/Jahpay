import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Get KYC status
 * GET /api/user/kyc-status
 */
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch from database

    const mockKYCStatus = {
      status: "verified",
      verified_at: new Date().toISOString(),
      document_type: "national_id",
      transaction_limits: {
        daily: 10000000,
        monthly: 100000000,
      },
    };

    return NextResponse.json(mockKYCStatus);
  } catch (error) {
    console.error("Get KYC status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
