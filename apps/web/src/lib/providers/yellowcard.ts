import { BaseProvider } from './base-provider';
import { ExchangeRate, ProviderQuote, ProviderQuoteRequest } from './types';

export class YellowCardProvider extends BaseProvider {
  private readonly sandboxUrl = 'https://sandbox.api.yellowcard.io/business';
  private readonly prodUrl = 'https://api.yellowcard.io/business';

  constructor(apiKey?: string) {
    super({
      name: 'Yellow Card',
      apiKey,
      baseUrl: apiKey ? 'https://api.yellowcard.io/business' : 'https://sandbox.api.yellowcard.io/business',
      feePercentage: 1.5, // 1.5% fee
      logo: '/providers/yellowcard.png',
      description: 'Fast and reliable fiat on/off ramp',
      supportedPairs: {
        from: ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'EUR'],
        to: ['BTC', 'ETH', 'USDC', 'USDT', 'CELO', 'cUSD', 'cEUR'],
      },
    });
  }

  async getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote> {
    const { from, to, amount } = request;
    
    try {
      // For Yellow Card, quotes are often tied to rates or initiated payments
      // We'll use the rates endpoint to get the current rate and calculate the quote
      const exchangeRate = await this.getExchangeRate(from, to);
      const rate = exchangeRate.rate;
      const toAmount = (parseFloat(amount) * rate).toFixed(8);
      const fee = this.calculateFee(amount);
      
      return {
        provider: this.name,
        fromAmount: amount,
        toAmount,
        rate,
        minAmount: '10', // $10 minimum (approx)
        maxAmount: '10000', // $10,000 maximum
        fee,
        providerFee: fee,
        networkFee: '0.0005', // Estimated network fee
        estimatedTime: '2-5 minutes',
        totalToReceive: (parseFloat(toAmount) - 0.0005).toFixed(8),
      };
    } catch (error) {
      console.error(`[${this.name} getQuote error]:`, error);
      throw new Error(
        `Failed to get quote from ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const timestamp = Date.now().toString();
      const response = await this.fetch<any>('/rates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-YC-Timestamp': timestamp,
        },
      });

      // Yellow Card returns an array of rates
      // Example: { rates: [ { code: "GHS", buy: 13.23, sell: 10.83, ... } ] }
      const rates = response.rates || [];
      const fiatCode = from.length === 3 ? from : to; // One of them should be fiat
      const targetRate = rates.find((r: any) => r.code.toUpperCase() === fiatCode.toUpperCase());

      if (!targetRate) {
        throw new Error(`Rate not found for ${fiatCode}`);
      }

      // If 'from' is fiat (on-ramp), we use 'buy' rate? 
      // Actually Yellow Card rates are usually Fiat/USDT or similar.
      // 1 USDT = buy NGN
      const rate = from.length === 3 
        ? 1 / targetRate.buy // NGN to Crypto
        : targetRate.sell;   // Crypto to NGN

      return {
        from,
        to,
        rate: rate,
        timestamp: Date.now(),
        provider: this.name,
      };
    } catch (error) {
      console.error(`[${this.name} getExchangeRate error]:`, error);
      // Fallback to simulated rate if API fails and we are in dev/sandbox
      if (!this.config.apiKey) {
        return {
          from,
          to,
          rate: this.getSimulatedRate(from, to),
          timestamp: Date.now(),
          provider: `${this.name} (Simulated)`,
        };
      }
      throw error;
    }
  }

  async getSupportedCurrencies() {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }

  // Helper method to simulate exchange rates (kept for sandbox/fallback)
  private getSimulatedRate(from: string, to: string): number {
    const baseRates: Record<string, number> = {
      'NGN': 1200, 'GHS': 12, 'ZAR': 18, 'KES': 150, 'USD': 1, 'EUR': 0.92,
      'BTC': 0.000025, 'ETH': 0.0005, 'USDC': 1, 'USDT': 1, 'CELO': 0.5, 'cUSD': 1, 'cEUR': 0.92,
    };
    const fromRate = baseRates[from.toUpperCase()] || 1;
    const toRate = baseRates[to.toUpperCase()] || 1;
    return fromRate / toRate;
  }
}
