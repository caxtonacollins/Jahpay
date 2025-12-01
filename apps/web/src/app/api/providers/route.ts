import { NextRequest, NextResponse } from "next/server";
import { ProviderFactory } from "@/lib/providers/aggregator";

/**
 * Get list of available providers
 * GET /api/providers
 */
export async function GET(req: NextRequest) {
  try {
    const factory = new ProviderFactory();
    const providerNames = factory.getProviderNames();

    const providers = providerNames.map((name: string) => ({
      name,
      is_active: true,
      countries: getCountriesForProvider(name),
      min_amount: getMinAmountForProvider(name),
      max_amount: getMaxAmountForProvider(name),
      fee_percentage: getFeeForProvider(name),
      completion_time: getCompletionTimeForProvider(name),
    }));

    return NextResponse.json({
      providers,
      count: providers.length,
    });
  } catch (error) {
    console.error("Get providers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

function getCountriesForProvider(provider: string): string[] {
  const countryMap: Record<string, string[]> = {
    yellowcard: ["NG", "GH", "KE", "UG", "TZ", "ZM", "ZA", "RW", "SN", "CM"],
    cashramp: ["NG", "GH", "KE", "UG"],
    bitmama: ["NG", "GH"],
  };
  return countryMap[provider] || [];
}

function getMinAmountForProvider(provider: string): number {
  const amountMap: Record<string, number> = {
    yellowcard: 100,
    cashramp: 50,
    bitmama: 100,
  };
  return amountMap[provider] || 100;
}

function getMaxAmountForProvider(provider: string): number {
  const amountMap: Record<string, number> = {
    yellowcard: 1000000,
    cashramp: 500000,
    bitmama: 500000,
  };
  return amountMap[provider] || 500000;
}

function getFeeForProvider(provider: string): number {
  const feeMap: Record<string, number> = {
    yellowcard: 1.5,
    cashramp: 2.0,
    bitmama: 2.5,
  };
  return feeMap[provider] || 2.0;
}

function getCompletionTimeForProvider(provider: string): number {
  const timeMap: Record<string, number> = {
    yellowcard: 30, // minutes
    cashramp: 45,
    bitmama: 60,
  };
  return timeMap[provider] || 60;
}
