import { BaseProvider } from "./base-provider";
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from "./types";

/**
 * Bitmama Provider
 * - Tertiary provider for on/off-ramp
 * - Supports mobile money and bank transfers
 * - Countries: Nigeria, Ghana
 */
export class BitmamaProvider extends BaseProvider {
  private readonly stagingUrl = "https://enterprise-api-staging.bitmama.io/v1";
  private readonly prodUrl = "https://enterprise-api.bitmama.io/v1";
  private apiKey: string;

  constructor(apiKey?: string) {
    super({
      name: "Bitmama",
      apiKey,
      baseUrl: apiKey ? "https://enterprise-api.bitmama.io/v1" : "https://enterprise-api-staging.bitmama.io/v1",
      feePercentage: 2.5, // 2.5% fee
      logo: "/providers/bitmama.png",
      description: "Mobile money and bank transfer ramp",
      supportedPairs: {
        from: ["NGN", "GHS", "USD"],
        to: ["BTC", "ETH", "USDC", "USDT", "CELO", "cUSD"],
      },
    });
    this.apiKey = apiKey || "";
  }

  /**
   * Get quote from Bitmama
   */
  async getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote> {
    const { from, to, amount } = request;

    try {
      const exchangeRate = await this.getExchangeRate(from, to);
      const rate = exchangeRate.rate;
      const toAmount = parseFloat(amount) * rate;
      const fee = this.calculateFee(amount);

      return {
        provider: this.config.name,
        fromAmount: amount,
        toAmount: String(toAmount),
        rate,
        minAmount: "50",
        maxAmount: "5000000",
        fee: String(fee),
        estimatedTime: "45-120 minutes",
        providerFee: String(fee),
        networkFee: "0",
        totalToReceive: String(toAmount),
      };
    } catch (error) {
      console.error("Bitmama quote error:", error);
      if (!this.apiKey) {
        return this.getSimulatedQuote(request);
      }
      throw new Error(`Failed to get Bitmama quote: ${error}`);
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      // ticker format: maticusd, btcnngn
      const ticker = `${to.toLowerCase()}${from.toLowerCase()}`;
      const response = await this.fetch<any>(`/rate?ticker=${ticker}`, {
        method: "GET",
        headers: {
          "token": this.apiKey,
        },
      });

      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch rate from Bitmama");
      }

      return {
        from,
        to,
        rate: response.message.buy, // or sell depending on direction
        provider: this.config.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Bitmama exchange rate error:", error);
      if (!this.apiKey) {
        return {
          from,
          to,
          rate: this.getSimulatedRate(from, to),
          provider: `${this.config.name} (Simulated)`,
          timestamp: Date.now(),
        };
      }
      throw new Error(`Failed to get Bitmama exchange rate: ${error}`);
    }
  }

  private getSimulatedQuote(request: ProviderQuoteRequest): ProviderQuote {
    const rate = 1250;
    const amount = parseFloat(request.amount);
    return {
      provider: this.config.name,
      fromAmount: request.amount,
      toAmount: String(amount / rate),
      rate,
      minAmount: "50",
      maxAmount: "5000000",
      fee: String(amount * 0.025),
      estimatedTime: "45-120 minutes",
      totalToReceive: String(amount / rate),
    };
  }

  private getSimulatedRate(from: string, to: string): number {
    const baseRates: Record<string, number> = {
      'NGN': 1250, 'GHS': 13, 'USD': 1,
      'BTC': 0.000024, 'ETH': 0.00048, 'USDC': 1, 'USDT': 1, 'CELO': 0.48, 'cUSD': 1,
    };
    const fromRate = baseRates[from.toUpperCase()] || 1;
    const toRate = baseRates[to.toUpperCase()] || 1;
    return fromRate / toRate;
  }

  async getSupportedCurrencies(): Promise<{ from: string[]; to: string[] }> {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }

  /**
   * Helper method to make API requests
   */
  protected async fetch<T>(
    endpoint: string,
    options: RequestInit & { url?: string } = {}
  ): Promise<T> {
    const url = options.url || `${this.config.baseUrl}${endpoint}`;

    const headers = new Headers({
      "Content-Type": "application/json",
      ...options.headers,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Bitmama API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
