import type { QuoteRequest, QuoteResponse } from "../../types/database";

/**
 * Base provider interface
 */
export interface IProvider {
  name: string;
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  initiateOnRamp(params: any): Promise<any>;
  initiateOffRamp(params: any): Promise<any>;
  getTransactionStatus(txId: string): Promise<any>;
  verifyBankAccount(accountNumber: string, bankCode: string): Promise<any>;
}

/**
 * Yellow Card Provider
 * - Primary provider for African markets
 * - Supports 20+ countries including Nigeria, Ghana, Kenya
 */
export class YellowCardProvider implements IProvider {
  name = "yellowcard";
  private apiKey: string;
  private apiUrl = "https://api.yellowcard.io/v1";
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/quotes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: request.amount,
          from: request.from_currency,
          to: request.to_currency,
          type: request.type,
          country: request.country,
        }),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        provider: this.name,
        rate: data.rate,
        fiat_amount: data.fiat_amount,
        crypto_amount: data.crypto_amount,
        fee: data.fee,
        total: data.total,
        expires_in: data.expires_in || 300,
      };
    } catch (error) {
      console.error("Yellow Card quote error:", error);
      throw error;
    }
  }

  async initiateOnRamp(params: {
    amount: number;
    currency: string;
    walletAddress: string;
    email?: string;
    callbackUrl?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "buy",
          crypto_amount: params.amount,
          currency: params.currency,
          wallet_address: params.walletAddress,
          email: params.email,
          callback_url: params.callbackUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate on-ramp: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        provider_tx_id: data.id,
        provider_url: data.checkout_url,
        expires_in: data.expires_in,
      };
    } catch (error) {
      console.error("Yellow Card on-ramp error:", error);
      throw error;
    }
  }

  async initiateOffRamp(params: {
    amount: number;
    currency: string;
    bankAccount: { account_number: string; bank_code: string };
    callbackUrl?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "sell",
          crypto_amount: params.amount,
          currency: params.currency,
          bank_account: params.bankAccount,
          callback_url: params.callbackUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate off-ramp: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        provider_tx_id: data.id,
        expires_in: data.expires_in,
      };
    } catch (error) {
      console.error("Yellow Card off-ramp error:", error);
      throw error;
    }
  }

  async getTransactionStatus(txId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${txId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transaction status: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        status: data.status,
        completed_at: data.completed_at,
        blockchain_tx_hash: data.blockchain_tx_hash,
      };
    } catch (error) {
      console.error("Yellow Card status error:", error);
      throw error;
    }
  }

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to verify bank account: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        is_valid: data.is_valid,
        account_name: data.account_name,
      };
    } catch (error) {
      console.error("Yellow Card bank verification error:", error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    const digest = hmac.update(JSON.stringify(payload)).digest("hex");
    return digest === signature;
  }
}

/**
 * Cashramp Provider
 * - Secondary provider
 * - Bank transfer only
 */
export class CashrampProvider implements IProvider {
  name = "cashramp";
  private apiKey: string;
  private apiUrl = "https://api.cashramp.co/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/rate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Cashramp API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        provider: this.name,
        rate: data.rate,
        fiat_amount:
          request.type === "buy" ? request.amount * data.rate : request.amount,
        crypto_amount:
          request.type === "sell" ? request.amount / data.rate : request.amount,
        fee: data.fee || 0,
        total:
          request.type === "buy"
            ? request.amount * data.rate + data.fee
            : request.amount,
        expires_in: 300,
      };
    } catch (error) {
      console.error("Cashramp quote error:", error);
      throw error;
    }
  }

  async initiateOnRamp(params: any): Promise<any> {
    // Implementation for Cashramp
    throw new Error("Not implemented");
  }

  async initiateOffRamp(params: any): Promise<any> {
    // Implementation for Cashramp
    throw new Error("Not implemented");
  }

  async getTransactionStatus(txId: string): Promise<any> {
    // Implementation for Cashramp
    throw new Error("Not implemented");
  }

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    // Implementation for Cashramp
    throw new Error("Not implemented");
  }
}

/**
 * Bitmama Provider
 * - Tertiary provider
 * - Supports mobile money and bank transfers
 */
export class BitmamaProvider implements IProvider {
  name = "bitmama";
  private apiKey: string;
  private apiUrl = "https://api.bitmama.io/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/rate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Bitmama API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        provider: this.name,
        rate: data.rate,
        fiat_amount:
          request.type === "buy" ? request.amount * data.rate : request.amount,
        crypto_amount:
          request.type === "sell" ? request.amount / data.rate : request.amount,
        fee: data.fee || 0,
        total:
          request.type === "buy"
            ? request.amount * data.rate + data.fee
            : request.amount,
        expires_in: 300,
      };
    } catch (error) {
      console.error("Bitmama quote error:", error);
      throw error;
    }
  }

  async initiateOnRamp(params: any): Promise<any> {
    // Implementation for Bitmama
    throw new Error("Not implemented");
  }

  async initiateOffRamp(params: any): Promise<any> {
    // Implementation for Bitmama
    throw new Error("Not implemented");
  }

  async getTransactionStatus(txId: string): Promise<any> {
    // Implementation for Bitmama
    throw new Error("Not implemented");
  }

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    // Implementation for Bitmama
    throw new Error("Not implemented");
  }
}

/**
 * Provider Factory
 */
export class ProviderFactory {
  private providers: Map<string, IProvider> = new Map();

  constructor() {
    const yellowCardKey = process.env.YELLOWCARD_API_KEY;
    const yellowCardSecret = process.env.YELLOWCARD_WEBHOOK_SECRET;
    const cashrampKey = process.env.CASHRAMP_API_KEY;
    const bitmamaKey = process.env.BITMAMA_API_KEY;

    if (yellowCardKey && yellowCardSecret) {
      this.providers.set(
        "yellowcard",
        new YellowCardProvider(yellowCardKey, yellowCardSecret)
      );
    }
    if (cashrampKey) {
      this.providers.set("cashramp", new CashrampProvider(cashrampKey));
    }
    if (bitmamaKey) {
      this.providers.set("bitmama", new BitmamaProvider(bitmamaKey));
    }
  }

  getProvider(name: string): IProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return provider;
  }

  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
}
