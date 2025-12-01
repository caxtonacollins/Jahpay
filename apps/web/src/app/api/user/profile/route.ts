import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Get user profile
 * GET /api/user/profile
 */
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch from database

    const mockProfile = {
      id: "user_123",
      wallet_address: walletAddress,
      country_code: "NG",
      preferred_provider: "yellowcard",
      kyc_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 * PUT /api/user/profile
 */
export async function PUT(req: NextRequest) {
  try {
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    // Validate updates
    const allowedFields = ["country_code", "preferred_provider"];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: Record<string, any>, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // In production, update in database

    return NextResponse.json({
      success: true,
      updates: filteredUpdates,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
