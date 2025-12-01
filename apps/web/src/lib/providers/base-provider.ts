import { ProviderQuote, ProviderQuoteRequest, ExchangeRate } from './types';

export abstract class BaseProvider {
  public readonly name: string;
  protected readonly config: any;

  constructor(config: any) {
    this.name = config.name;
    this.config = {
      ...config,
      baseUrl: config.baseUrl || '',
      isActive: config.isActive !== false,
    };
  }

  abstract getQuote(request: ProviderQuoteRequest): Promise<ProviderQuote>;
  abstract getExchangeRate(from: string, to: string): Promise<ExchangeRate>;
  abstract getSupportedCurrencies(): Promise<{
    from: string[];
    to: string[];
  }>;

  // Helper method to make API requests
  protected async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(this.config.apiKey && { 'X-API-KEY': this.config.apiKey }),
      ...options.headers,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await this.parseError(response);
        throw new Error(
          errorData?.message ||
            `Request failed with status ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(`[${this.name} API Error]:`, error);
      throw new Error(
        `Failed to connect to ${this.name} service. Please try again later.`
      );
    }
  }

  private async parseError(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  // Helper to format currency amounts
  protected formatAmount(amount: string | number, decimals: number = 8): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(decimals);
  }

  // Helper to calculate fees
  protected calculateFee(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const fee = (num * this.config.feePercentage) / 100;
    return this.formatAmount(fee);
  }

  // Helper to check if a currency pair is supported
  public async isPairSupported(from: string, to: string): Promise<boolean> {
    const { from: fromCurrencies, to: toCurrencies } =
      await this.getSupportedCurrencies();
    return (
      fromCurrencies.includes(from.toUpperCase()) &&
      toCurrencies.includes(to.toUpperCase())
    );
  }
}
