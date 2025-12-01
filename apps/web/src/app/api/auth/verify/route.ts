import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

/**
 * Verify wallet signature and create session
 * POST /api/auth/verify
 */
export async function POST(req: NextRequest) {
  try {
    const { address, message, signature } = await req.json();

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the signature
    try {
      const isValid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Signature verification failed" },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Signature verification error:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // In production:
    // 1. Check if user exists in database
    // 2. If not, create new user
    // 3. Create session/JWT token
    // 4. Return token

    // For now, return success
    const token = Buffer.from(address).toString("base64");

    const response = NextResponse.json({
      success: true,
      address,
      token,
    });

    // Set httpOnly cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signature verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify signature" },
      { status: 500 }
    );
  }
}
