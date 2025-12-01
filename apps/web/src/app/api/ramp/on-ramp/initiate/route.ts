import { NextRequest, NextResponse } from "next/server";
import type {
  InitiateOnRampRequest,
  InitiateOnRampResponse,
} from "types/database";
import { ProviderFactory } from "@/lib/providers/aggregator";
import { validateOnRampForm } from "@/lib/utils/validation";

/**
 * Initiate on-ramp transaction
 * POST /api/ramp/on-ramp/initiate
 *
 * Request body:
 * {
 *   amount: number,
 *   crypto_currency: string,
 *   fiat_currency: string,
 *   fiat_amount: number,
 *   country_code: string,
 *   preferred_provider?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body: InitiateOnRampRequest = await req.json();

    // Validate request
    const validation = validateOnRampForm(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Get wallet address from auth header (JWT or session)
    const authHeader = req.headers.get("Authorization");
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
      // Auto-select best provider (first available for now)
      const factory = new ProviderFactory();
      const providers = factory.getAllProviders();
      provider = providers[0];
    }

    // In production, you would:
    // 1. Store transaction in database
    // 2. Call provider API to initiate
    // 3. Webhook from provider updates status

    const mockResponse: InitiateOnRampResponse = {
      transaction_id: `tx_${Date.now()}`,
      provider: provider.name,
      status: "pending",
      provider_url: `https://provider.example.com/checkout?tx=${Date.now()}`,
      expires_in: 300,
    };

    return NextResponse.json(mockResponse, { status: 201 });
  } catch (error) {
    console.error("On-ramp initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate on-ramp" },
      { status: 500 }
    );
  }
}
