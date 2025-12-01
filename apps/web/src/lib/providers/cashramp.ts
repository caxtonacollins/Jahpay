import { BaseProvider } from "./base-provider";
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from "./types";

/**
 * Cashramp Provider
 * - Secondary provider for on/off-ramp
 * - Bank transfer focused
 * - Countries: Nigeria, Ghana, Kenya, Uganda
 */
export class CashrampProvider extends BaseProvider {
  private readonly baseUrl = "https://api.cashramp.com/v1";
  private apiKey: string;

  constructor(apiKey?: string) {
    super({
      name: "Cashramp",
      apiKey,
      baseUrl: "https://api.cashramp.com/v1",
      feePercentage: 2.0, // 2% fee
      logo: "/providers/cashramp.png",
      description: "Bank transfer on/off ramp for African markets",
      supportedPairs: {
        from: ["NGN", "GHS", "KES", "UGX"],
        to: ["BTC", "ETH", "USDC", "USDT", "CELO", "cUSD"],
      },
    });
    this.apiKey = apiKey || "";
  }

  /**
   * Get quote from Cashramp
   */
  async getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote> {
    const { from, to, amount, address } = request;

    try {
      const response = await this.fetch<any>("/quote", {
        method: "POST",
        body: JSON.stringify({
          from_currency: from,
          to_currency: to,
          amount,
          type: "buy", // Cashramp endpoint for buying crypto
        }),
      });

      const rate =
        response.rate ||
        (1 / parseFloat(amount)) * parseFloat(response.amount_out);
      const fee = parseFloat(amount) * (this.config.feePercentage / 100);

      return {
        provider: this.config.name,
        fromAmount: amount,
        toAmount: response.amount_out || String(parseFloat(amount) / rate),
        rate,
        minAmount: response.min_amount || "100",
        maxAmount: response.max_amount || "1000000",
        fee: String(fee),
        estimatedTime: "30-60 minutes",
        providerFee: String(fee),
        networkFee: "0",
        totalToReceive:
          response.amount_out || String(parseFloat(amount) / rate),
      };
    } catch (error) {
      console.error("Cashramp quote error:", error);
      throw new Error(`Failed to get Cashramp quote: ${error}`);
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
      console.error("Cashramp exchange rate error:", error);
      throw new Error(`Failed to get Cashramp exchange rate: ${error}`);
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
   * Initiate on-ramp transaction
   */
  async initiateOnRamp(params: {
    amount: number;
    fiatCurrency: string;
    cryptoCurrency: string;
    walletAddress: string;
    callbackUrl: string;
  }): Promise<any> {
    try {
      const response = await this.fetch<any>("/transactions/initiate", {
        method: "POST",
        body: JSON.stringify({
          fiat_amount: params.amount,
          fiat_currency: params.fiatCurrency,
          crypto_currency: params.cryptoCurrency,
          wallet_address: params.walletAddress,
          callback_url: params.callbackUrl,
          type: "buy",
        }),
      });

      return {
        transactionId: response.transaction_id,
        status: "pending",
        paymentUrl: response.payment_url,
        expiresIn: 900, // 15 minutes
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("Cashramp on-ramp error:", error);
      throw new Error(`Failed to initiate Cashramp on-ramp: ${error}`);
    }
  }

  /**
   * Initiate off-ramp transaction
   */
  async initiateOffRamp(params: {
    amount: number;
    cryptoCurrency: string;
    fiatCurrency: string;
    bankAccount: any;
    callbackUrl: string;
  }): Promise<any> {
    try {
      const response = await this.fetch<any>("/transactions/initiate", {
        method: "POST",
        body: JSON.stringify({
          crypto_amount: params.amount,
          crypto_currency: params.cryptoCurrency,
          fiat_currency: params.fiatCurrency,
          bank_account: params.bankAccount,
          callback_url: params.callbackUrl,
          type: "sell",
        }),
      });

      return {
        transactionId: response.transaction_id,
        status: "pending",
        expiresIn: 900,
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("Cashramp off-ramp error:", error);
      throw new Error(`Failed to initiate Cashramp off-ramp: ${error}`);
    }
  }

  /**
   * Get transaction status
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
      console.error("Cashramp transaction status error:", error);
      throw new Error(`Failed to get Cashramp transaction status: ${error}`);
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
        currency: response.currency,
      };
    } catch (error) {
      console.error("Cashramp bank verification error:", error);
      throw new Error(`Failed to verify bank account with Cashramp: ${error}`);
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
      console.error("Cashramp get banks error:", error);
      throw new Error(`Failed to get supported banks from Cashramp: ${error}`);
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
        `Cashramp API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
