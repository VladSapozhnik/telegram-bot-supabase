import { IExchangeRateProvider } from "../ports/index.ts";

export class FrankfurterRateAdapter implements IExchangeRateProvider {
  private baseUrl: string;
  private supportedCurrenciesCache: string[] | null = null;

  constructor(baseUrl: string = "https://api.frankfurter.dev/v1") {
    this.baseUrl = baseUrl;
  }

  async getSupportedCurrencies(): Promise<string[]> {
    if (this.supportedCurrenciesCache) {
      return this.supportedCurrenciesCache;
    }

    try {
      const res = await fetch(`${this.baseUrl}/currencies`);
      if (!res.ok) {
        throw new Error(`Failed to fetch currencies: ${res.statusText}`);
      }
      const data = await res.json();
      this.supportedCurrenciesCache = Object.keys(data).map((c) => c.toUpperCase());
      return this.supportedCurrenciesCache;
    } catch (e) {
      console.error("Error fetching supported currencies from Frankfurter:", e);
      return [
        "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
        "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
        "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
      ];
    }
  }

  async getUsdRate(currency: string): Promise<number | null> {
    const symbol = currency.toUpperCase().trim();
    if (symbol === "USD") {
      return 1;
    }

    try {
      const res = await fetch(`${this.baseUrl}/latest?base=USD&symbols=${symbol}`);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const rate = data?.rates?.[symbol];
      return typeof rate === "number" ? rate : null;
    } catch (error) {
      console.error(`Error fetching rate for ${symbol}:`, error);
      return null;
    }
  }
}
