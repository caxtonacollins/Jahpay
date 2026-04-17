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
    const factory = new ProviderFactory();
    let provider;
    
    try {
      if (body.preferred_provider) {
        provider = factory.getProvider(body.preferred_provider);
      } else {
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
      // In a real app, you would fetch bank account details from database here
      const mockBankAccount = {
        account_number: "0123456789",
        bank_code: "058", // GTBank Nigeria
      };

      const initiationResult = await provider.initiateOffRamp({
        amount: body.amount,
        currency: body.fiat_currency,
        bankAccount: mockBankAccount,
        // Optional: callbackUrl: ...
      });

      // In production, you would also store the transaction in your database here

      const response: InitiateOffRampResponse = {
        transaction_id: initiationResult.provider_tx_id || `tx_${Date.now()}`,
        provider: provider.name,
        status: "pending",
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
    console.error("Off-ramp initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate off-ramp" },
      { status: 500 }
    );
  }
}
