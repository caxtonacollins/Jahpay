import { NextRequest, NextResponse } from "next/server";
import { ProviderFactory } from "@/lib/providers/aggregator";
import { validateOffRampForm } from "@/lib/utils/validation";
import { InitiateOffRampRequest, InitiateOffRampResponse } from "types/database";

/**
 * Initiate off-ramp transaction
 * POST /api/ramp/off-ramp/initiate
 *
 * Request body:
 * {
 *   amount: number,
 *   crypto_currency: string,
 *   fiat_currency: string,
 *   bank_account_id: string,
 *   country_code: string,
 *   preferred_provider?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: InitiateOffRampRequest = await req.json();

    // Validate request
    const validation = validateOffRampForm(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Get wallet address from auth header
    const walletAddress = req.headers.get("X-Wallet-Address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized: No wallet address" },
        { status: 401 }
      );
    }

    // Select provider
    let provider;
    if (body.preferred_provider) {
      try {
        const factory = new ProviderFactory();
        provider = factory.getProvider(body.preferred_provider);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid provider" },
          { status: 400 }
        );
      }
    } else {
      // Auto-select best provider
      const factory = new ProviderFactory();
      const providers = factory.getAllProviders();
      provider = providers[0];
    }

    // In production, you would:
    // 1. Verify bank account
    // 2. Lock tokens in smart contract
    // 3. Store transaction in database
    // 4. Call provider API

    const mockResponse: InitiateOffRampResponse = {
      transaction_id: `tx_${Date.now()}`,
      provider: provider.name,
      status: "pending",
      expires_in: 300,
    };

    return NextResponse.json(mockResponse, { status: 201 });
  } catch (error) {
    console.error("Off-ramp initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate off-ramp" },
      { status: 500 }
    );
  }
}
