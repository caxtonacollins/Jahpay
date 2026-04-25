import { BaseProvider } from './base-provider';
import { ExchangeRate, ProviderQuote, ProviderQuoteRequest } from './types';
import { buildYellowCardHeaders } from './yellowcard-auth';

export class YellowCardProvider extends BaseProvider {
  private readonly baseUrl = 'https://api.yellowcard.io/business';
  private readonly sandboxUrl = 'https://sandbox.api.yellowcard.io/business';
  private apiSecret?: string;
  private useSandbox: boolean;

  constructor(apiKey?: string, apiSecret?: string, useSandbox: boolean = false) {
    super({
      name: 'Yellow Card',
      apiKey,
      baseUrl: useSandbox ? 'https://sandbox.api.yellowcard.io/business' : 'https://api.yellowcard.io/business',
      feePercentage: 1.5, // 1.5% fee
      logo: '/providers/yellowcard.png',
      description: 'Fast and reliable fiat on/off ramp',
      supportedPairs: {
        from: ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'EUR', 'UGX', 'TZS'],
        to: ['USDC', 'USDT', 'CELO', 'cUSD', 'cEUR'],
      },
    });
    this.apiSecret = apiSecret;
    this.useSandbox = useSandbox;
  }

  /**
   * Get a quote for a fiat/crypto conversion
   * For MVP, uses simulated rates. In production, would call YellowCard's
   * /business/sends or /business/receives endpoints with proper HMAC auth
   */
  async getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote> {
    const { from, to, amount } = request;

    try {
      // Validate pair is supported
      const supported = await this.isPairSupported(from, to);
      if (!supported) {
        throw new Error(`${from}/${to} pair not supported by YellowCard`);
      }

      // For MVP: Use simulated rates
      // In production, this would call:
      // POST /business/sends (for crypto to fiat)
      // POST /business/receives (for fiat to crypto)
      // with proper HMAC-SHA256 authentication

      const rate = this.getSimulatedRate(from, to);
      const toAmount = (parseFloat(amount) * rate).toFixed(8);
      const fee = this.calculateFee(amount);
      const networkFee = '0.0005';

      return {
        provider: this.name,
        fromAmount: amount,
        toAmount,
        rate,
        minAmount: '10',
        maxAmount: '10000',
        fee,
        providerFee: fee,
        networkFee,
        estimatedTime: '2-5 minutes',
        totalToReceive: (parseFloat(toAmount) - parseFloat(networkFee)).toFixed(8),
      };
    } catch (error) {
      console.error(`[${this.name} getQuote error]:`, error);
      throw new Error(
        `Failed to get quote from ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const rate = this.getSimulatedRate(from, to);

      return {
        from,
        to,
        rate,
        timestamp: Date.now(),
        provider: this.name,
      };
    } catch (error) {
      console.error(`[${this.name} getExchangeRate error]:`, error);
      throw new Error(
        `Failed to get exchange rate from ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get supported currencies for this provider
   */
  async getSupportedCurrencies() {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }

  /**
   * Simulate exchange rates based on real market data
   * In production, these would come from YellowCard's API
   */
  private getSimulatedRate(from: string, to: string): number {
    const baseRates: Record<string, number> = {
      // Fiat currencies (rates relative to USD)
      'NGN': 1200,    // 1 USD = 1200 NGN
      'GHS': 12,      // 1 USD = 12 GHS
      'ZAR': 18,      // 1 USD = 18 ZAR
      'KES': 150,     // 1 USD = 150 KES
      'UGX': 3700,    // 1 USD = 3700 UGX
      'TZS': 2500,    // 1 USD = 2500 TZS
      'USD': 1,
      'EUR': 0.92,    // 1 USD = 0.92 EUR

      // Stablecoins (1:1 with USD)
      'USDC': 1,
      'USDT': 1,
      'cUSD': 1,
      'cEUR': 0.92,

      // Crypto (approximate rates)
      'CELO': 0.5,    // 1 CELO ≈ 2 USD
      'BTC': 0.000025, // 1 BTC ≈ 40,000 USD
      'ETH': 0.0005,   // 1 ETH ≈ 2,000 USD
    };

    const fromRate = baseRates[from.toUpperCase()] || 1;
    const toRate = baseRates[to.toUpperCase()] || 1;

    // Add slight variation to simulate market changes (±2%)
    const variation = 0.98 + Math.random() * 0.04;

    return (fromRate / toRate) * variation;
  }
}
