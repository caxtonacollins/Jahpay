import { BaseProvider } from './base-provider';
import { ExchangeRate, ProviderQuote, ProviderQuoteRequest } from './types';

export class YellowCardProvider extends BaseProvider {
  private readonly baseUrl = 'https://api.yellowcard.io/v1';

  constructor(apiKey?: string) {
    super({
      name: 'Yellow Card',
      apiKey,
      baseUrl: 'https://api.yellowcard.io/v1',
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
    const { from, to, amount, address } = request;
    
    try {
      // In a real implementation, this would call the Yellow Card API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate API response
      const rate = this.getSimulatedRate(from, to);
      const toAmount = (parseFloat(amount) * rate).toFixed(8);
      const fee = this.calculateFee(amount);
      
      return {
        provider: this.name,
        fromAmount: amount,
        toAmount,
        rate,
        minAmount: '10', // $10 minimum
        maxAmount: '10000', // $10,000 maximum
        fee,
        providerFee: fee,
        networkFee: '0.0005', // Simulated network fee
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
      // In a real implementation, this would call the Yellow Card API
      await new Promise(resolve => setTimeout(resolve, 300));
      
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

  async getSupportedCurrencies() {
    return {
      from: this.config.supportedPairs.from,
      to: this.config.supportedPairs.to,
    };
  }

  // Helper method to simulate exchange rates
  private getSimulatedRate(from: string, to: string): number {
    // Base rates (these would come from the API in a real implementation)
    const baseRates: Record<string, number> = {
      'NGN': 1200,  // 1 USD = 1200 NGN
      'GHS': 12,    // 1 USD = 12 GHS
      'ZAR': 18,    // 1 USD = 18 ZAR
      'KES': 150,   // 1 USD = 150 KES
      'USD': 1,
      'EUR': 0.92,  // 1 USD = 0.92 EUR
      'BTC': 0.000025, // 1 BTC = 40,000 USD
      'ETH': 0.0005,  // 1 ETH = 2,000 USD
      'USDC': 1,
      'USDT': 1,
      'CELO': 0.5,   // 1 CELO = 2 USD
      'cUSD': 1,
      'cEUR': 0.92,
    };

    // Convert both currencies to USD first, then to the target currency
    const fromRate = baseRates[from.toUpperCase()] || 1;
    const toRate = baseRates[to.toUpperCase()] || 1;
    
    // Add some random variation to simulate market changes
    const variation = 0.95 + Math.random() * 0.1; // ±5% variation
    
    return (fromRate / toRate) * variation;
  }
}
