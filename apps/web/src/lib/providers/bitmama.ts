import { BaseProvider } from "./base-provider";
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from "./types";

/**
 * Bitmama Provider
 * - Tertiary provider for on/off-ramp
 * - Supports mobile money and bank transfers
 * - Countries: Nigeria, Ghana
 */
export class BitmamaProvider extends BaseProvider {
  private readonly baseUrl = "https://api.bitmama.com/api/v1";
  private apiKey: string;

  constructor(apiKey?: string) {
    super({
      name: "Bitmama",
      apiKey,
      baseUrl: "https://api.bitmama.com/api/v1",
      feePercentage: 2.5, // 2.5% fee
      logo: "/providers/bitmama.png",
      description: "Mobile money and bank transfer ramp",
      supportedPairs: {
        from: ["NGN", "GHS"],
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
      const response = await this.fetch<any>("/rates", {
        method: "POST",
        body: JSON.stringify({
          from_currency: from,
          to_currency: to,
          amount: parseFloat(amount),
        }),
      });

      const rate =
        response.rate ||
        (1 / parseFloat(amount)) * parseFloat(response.to_amount);
      const fee = parseFloat(amount) * (this.config.feePercentage / 100);

      return {
        provider: this.config.name,
        fromAmount: amount,
        toAmount: response.to_amount || String(parseFloat(amount) / rate),
        rate,
        minAmount: response.min_amount || "50",
        maxAmount: response.max_amount || "5000000",
        fee: String(fee),
        estimatedTime: "45-120 minutes",
        providerFee: String(fee),
        networkFee: "0",
        totalToReceive: response.to_amount || String(parseFloat(amount) / rate),
      };
    } catch (error) {
      console.error("Bitmama quote error:", error);
      throw new Error(`Failed to get Bitmama quote: ${error}`);
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const response = await this.fetch<any>("/rates", {
        method: "GET",
        url: `${this.baseUrl}/rates?from=${from}&to=${to}`,
      });

      return {
        from,
        to,
        rate: response.rate,
        provider: this.config.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Bitmama exchange rate error:", error);
      throw new Error(`Failed to get Bitmama exchange rate: ${error}`);
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<{ from: string[]; to: string[] }> {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }

  /**
   * Create deposit (on-ramp)
   */
  async initiateOnRamp(params: {
    amount: number;
    fiatCurrency: string;
    cryptoCurrency: string;
    walletAddress: string;
    paymentMethod: "bank_transfer" | "mobile_money";
    callbackUrl: string;
  }): Promise<any> {
    try {
      const response = await this.fetch<any>("/transactions/deposit", {
        method: "POST",
        body: JSON.stringify({
          fiat_amount: params.amount,
          fiat_currency: params.fiatCurrency,
          crypto_currency: params.cryptoCurrency,
          wallet_address: params.walletAddress,
          payment_method: params.paymentMethod,
          callback_url: params.callbackUrl,
        }),
      });

      return {
        transactionId: response.transaction_id,
        status: "pending",
        paymentDetails: response.payment_details,
        expiresIn: 1800, // 30 minutes
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("Bitmama deposit error:", error);
      throw new Error(`Failed to initiate Bitmama deposit: ${error}`);
    }
  }

  /**
   * Create withdrawal (off-ramp)
   */
  async initiateOffRamp(params: {
    amount: number;
    cryptoCurrency: string;
    fiatCurrency: string;
    destination: "bank_account" | "mobile_money" | any;
    callbackUrl: string;
  }): Promise<any> {
    try {
      const response = await this.fetch<any>("/transactions/withdrawal", {
        method: "POST",
        body: JSON.stringify({
          crypto_amount: params.amount,
          crypto_currency: params.cryptoCurrency,
          fiat_currency: params.fiatCurrency,
          destination: params.destination,
          callback_url: params.callbackUrl,
        }),
      });

      return {
        transactionId: response.transaction_id,
        status: "pending",
        expiresIn: 1800,
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("Bitmama withdrawal error:", error);
      throw new Error(`Failed to initiate Bitmama withdrawal: ${error}`);
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionStatus(txId: string): Promise<any> {
    try {
      const response = await this.fetch<any>(`/transactions/${txId}`, {
        method: "GET",
      });

      return {
        transactionId: response.transaction_id,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        timestamp: response.timestamp,
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("Bitmama transaction status error:", error);
      throw new Error(`Failed to get Bitmama transaction status: ${error}`);
    }
  }

  /**
   * Verify bank account
   */
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    try {
      const response = await this.fetch<any>("/bank/verify", {
        method: "POST",
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
        }),
      });

      return {
        valid: response.valid,
        accountName: response.account_name,
        bankName: response.bank_name,
      };
    } catch (error) {
      console.error("Bitmama bank verification error:", error);
      throw new Error(`Failed to verify bank account with Bitmama: ${error}`);
    }
  }

  /**
   * Get supported banks
   */
  async getSupportedBanks(countryCode: string): Promise<any[]> {
    try {
      const response = await this.fetch<any>(`/banks?country=${countryCode}`, {
        method: "GET",
      });

      return response.banks || [];
    } catch (error) {
      console.error("Bitmama get banks error:", error);
      throw new Error(`Failed to get supported banks from Bitmama: ${error}`);
    }
  }

  /**
   * Helper method to make API requests
   */
  protected async fetch<T>(
    endpoint: string,
    options: RequestInit & { url?: string } = {}
  ): Promise<T> {
    const url = options.url || `${this.baseUrl}${endpoint}`;

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
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
