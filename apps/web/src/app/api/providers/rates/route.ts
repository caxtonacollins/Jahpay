import { NextRequest, NextResponse } from "next/server";
import { ProviderFactory } from "@/lib/providers/factory";

export const dynamic = 'force-dynamic';

/**
 * Get exchange rates from all providers
 * GET /api/providers/rates?from=NGN&to=USDC&amount=100000
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const amount = searchParams.get("amount");

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters: from, to, amount" },
        { status: 400 }
      );
    }

    const factory = ProviderFactory.getInstance();
    await factory.initialize();

    const quoteRequest = {
      from,
      to,
      amount,
    };

    // Get all quotes
    const { bestQuote, allQuotes } = await factory.getBestQuote(quoteRequest);

    // Get all rates
    const rates = await factory.getExchangeRates(from, to);

    return NextResponse.json({
      from,
      to,
      amount,
      bestQuote,
      allQuotes,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get rates error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch rates",
      },
      { status: 500 }
    );
  }
}
