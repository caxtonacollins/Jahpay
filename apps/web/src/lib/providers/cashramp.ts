import { BaseProvider } from "./base-provider";
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from "./types";

/**
 * Cashramp Provider
 * - Secondary provider for on/off-ramp
 * - Bank transfer focused
 * - Countries: Nigeria, Ghana, Kenya, Uganda
 */
export class CashrampProvider extends BaseProvider {
  private readonly graphqlUrl = "https://api.useaccrue.com/cashramp/api/graphql";
  private apiKey: string;

  constructor(apiKey?: string) {
    super({
      name: "Cashramp",
      apiKey,
      baseUrl: "https://api.useaccrue.com/cashramp/api/graphql",
      feePercentage: 2.0, // 2% fee
      logo: "/providers/cashramp.png",
      description: "Bank transfer on/off ramp for African markets",
      supportedPairs: {
        from: ["NGN", "GHS", "KES", "UGX", "USD"],
        to: ["BTC", "ETH", "USDC", "USDT", "CELO", "cUSD"],
      },
    });
    this.apiKey = apiKey || "";
  }

  /**
   * Get quote from Cashramp using GraphQL
   */
  async getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote> {
    const { from, to, amount } = request;

    try {
      const query = `
        query GetRampQuote($amount: Float!, $currency: String!, $country: String!, $paymentType: String!) {
          rampQuote(amount: $amount, currency: $currency, country: $country, paymentType: $paymentType) {
            id
            exchangeRate
            totalAmount
            feeAmount
            paymentType
          }
        }
      `;

      // Determine payment type and country
      const isOffRamp = ['BTC', 'ETH', 'USDC', 'USDT', 'CELO', 'cUSD'].includes(from.toUpperCase());
      const paymentType = isOffRamp ? "withdrawal" : "deposit";
      const country = "NG"; // Default to NG, could be derived from currency

      const response = await this.fetchGraphQL<any>(query, {
        amount: parseFloat(amount),
        currency: isOffRamp ? to.toLowerCase() : from.toLowerCase(),
        country,
        paymentType,
      });

      const quote = response.data.rampQuote;
      const rate = quote.exchangeRate;
      const fee = quote.feeAmount;

      return {
        provider: this.config.name,
        fromAmount: amount,
        toAmount: String(quote.totalAmount),
        rate,
        minAmount: "100",
        maxAmount: "1000000",
        fee: String(fee),
        estimatedTime: "30-60 minutes",
        providerFee: String(fee),
        networkFee: "0",
        totalToReceive: String(quote.totalAmount),
      };
    } catch (error) {
      console.error("Cashramp quote error:", error);
      // Fallback in case of API failure during development
      if (!this.apiKey) {
        return this.getSimulatedQuote(request);
      }
      throw new Error(`Failed to get Cashramp quote: ${error}`);
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      // GraphQL doesn't have a direct "rates" query in the snippet, 
      // but we can get a quote for a unit amount
      const quote = await this.getQuote({ from, to, amount: "1" });

      return {
        from,
        to,
        rate: quote.rate,
        provider: this.config.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Cashramp exchange rate error:", error);
      throw new Error(`Failed to get Cashramp exchange rate: ${error}`);
    }
  }

  private getSimulatedQuote(request: ProviderQuoteRequest): ProviderQuote {
    const rate = 1200; // Simulated NGN/USD
    const amount = parseFloat(request.amount);
    return {
      provider: this.config.name,
      fromAmount: request.amount,
      toAmount: String(amount / rate),
      rate,
      minAmount: "100",
      maxAmount: "1000000",
      fee: String(amount * 0.02),
      estimatedTime: "30-60 minutes",
      totalToReceive: String(amount / rate),
    };
  }

  /**
   * Helper method to make GraphQL requests
   */
  protected async fetchGraphQL<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    });

    const response = await fetch(this.graphqlUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Cashramp GraphQL error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(`Cashramp GraphQL error: ${result.errors[0].message}`);
    }

    return result;
  }

  async getSupportedCurrencies(): Promise<{ from: string[]; to: string[] }> {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }
}
