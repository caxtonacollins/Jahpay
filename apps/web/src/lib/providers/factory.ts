import { BaseProvider } from "./base-provider";
import { ProviderQuote, ExchangeRate, ProviderQuoteRequest } from "./types";
import { YellowCardProvider } from "./yellowcard";
import { CashrampProvider } from "./cashramp";
import { BitmamaProvider } from "./bitmama";

type ProviderName = "yellowcard" | "cashramp" | "bitmama";

export class ProviderFactory {
  private static instance: ProviderFactory;
  private providers: Map<ProviderName, BaseProvider> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  public async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Yellow Card
      if (process.env.NEXT_PUBLIC_YELLOWCARD_API_KEY) {
        this.register(
          "yellowcard",
          new YellowCardProvider(process.env.NEXT_PUBLIC_YELLOWCARD_API_KEY)
        );
      }

      // Initialize Cashramp
      if (process.env.NEXT_PUBLIC_CASHRAMP_API_KEY) {
        this.register(
          "cashramp",
          new CashrampProvider(process.env.NEXT_PUBLIC_CASHRAMP_API_KEY)
        );
      }

      // Initialize Bitmama
      if (process.env.NEXT_PUBLIC_BITMAMA_API_KEY) {
        this.register(
          "bitmama",
          new BitmamaProvider(process.env.NEXT_PUBLIC_BITMAMA_API_KEY)
        );
      }

      this.initialized = true;
      console.log("Providers initialized:", this.getAllProviders());
    } catch (error) {
      console.error("Error initializing providers:", error);
      throw new Error("Failed to initialize payment providers");
    }
  }

  public register(name: ProviderName, provider: BaseProvider) {
    this.providers.set(name, provider);
  }

  public getProvider(name: ProviderName): BaseProvider | undefined {
    return this.providers.get(name);
  }

  public getAllProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  public getActiveProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  public async getBestQuote(
    request: ProviderQuoteRequest
  ): Promise<{ bestQuote: ProviderQuote; allQuotes: ProviderQuote[] }> {
    const providers = this.getActiveProviders();
    if (providers.length === 0) {
      throw new Error("No active providers available");
    }

    // Get quotes from all providers in parallel
    const quotePromises = providers.map(async (provider) => {
      try {
        const quote = await provider.getQuote(request);
        return quote;
      } catch (error) {
        console.error(`Error getting quote from ${provider.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    const validQuotes = results.filter(
      (quote): quote is ProviderQuote => quote !== null
    );

    if (validQuotes.length === 0) {
      throw new Error("No valid quotes available from any provider");
    }

    // Find the best quote (highest toAmount)
    const bestQuote = validQuotes.reduce((best, current) =>
      parseFloat(current.toAmount) > parseFloat(best.toAmount) ? current : best
    );

    return {
      bestQuote,
      allQuotes: validQuotes,
    };
  }

  public async getExchangeRates(
    from: string,
    to: string
  ): Promise<ExchangeRate[]> {
    const providers = this.getActiveProviders();
    const ratePromises = providers.map(async (provider) => {
      try {
        return provider.getExchangeRate(from, to);
      } catch (error) {
        console.error(`Error getting rate from ${provider.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(ratePromises);
    return results.filter((rate): rate is ExchangeRate => rate !== null);
  }

  public async getProviderForPair(
    from: string,
    to: string
  ): Promise<BaseProvider[]> {
    const providers = this.getActiveProviders();
    const supportedProviders = await Promise.all(
      providers.map(async (provider) => {
        try {
          const isSupported = await provider.isPairSupported(from, to);
          return isSupported ? provider : null;
        } catch {
          return null;
        }
      })
    );
    return supportedProviders.filter((p): p is BaseProvider => p !== null);
  }
}

// Singleton instance
export const providerFactory = ProviderFactory.getInstance();

// Initialize the factory when this module is loaded
if (typeof window !== "undefined") {
  providerFactory.initialize().catch(console.error);
}
