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
    const factory = new ProviderFactory();
    let provider;
    
    try {
      if (body.preferred_provider) {
        provider = factory.getProvider(body.preferred_provider);
      } else {
        // Auto-select best provider (first available for now)
        const providers = factory.getAllProviders();
        if (providers.length === 0) {
          throw new Error("No providers available");
        }
        provider = providers[0];
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Provider selection failed" },
        { status: 400 }
      );
    }

    // Call provider API to initiate
    try {
      const initiationResult = await provider.initiateOnRamp({
        amount: body.amount,
        currency: body.fiat_currency,
        walletAddress: walletAddress,
        // Optional: email: user.email, callbackUrl: ...
      });

      // In production, you would also store the transaction in your database here
      // For MVP, we'll return the provider results directly

      const response: InitiateOnRampResponse = {
        transaction_id: initiationResult.provider_tx_id || `tx_${Date.now()}`,
        provider: provider.name,
        status: "pending",
        provider_url: initiationResult.provider_url,
        expires_in: initiationResult.expires_in || 300,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      console.error("Provider initiation error:", error);
      return NextResponse.json(
        { error: "Provider failed to initiate transaction" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("On-ramp initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate on-ramp" },
      { status: 500 }
    );
  }
}
