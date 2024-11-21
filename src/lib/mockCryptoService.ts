import { supportedCryptos } from './cryptoList';

interface PriceData {
  price: number;
  change24h: number;
}

const INITIAL_PRICES: Record<string, PriceData> = {
  BTC: { price: 43250.25, change24h: 2.35 },
  ETH: { price: 2250.75, change24h: 1.85 },
  BNB: { price: 305.50, change24h: -0.75 },
  SOL: { price: 98.25, change24h: 4.20 },
  XRP: { price: 0.55, change24h: -1.15 },
  USDT: { price: 1.00, change24h: 0.01 },
  ADA: { price: 0.45, change24h: -2.30 },
  AVAX: { price: 35.75, change24h: 3.45 },
  DOGE: { price: 0.085, change24h: -1.25 },
  DOT: { price: 7.85, change24h: 1.95 },
  MATIC: { price: 0.85, change24h: -0.65 },
  LINK: { price: 15.25, change24h: 2.85 },
  UNI: { price: 5.95, change24h: -1.45 },
  ATOM: { price: 9.75, change24h: 1.15 },
  LTC: { price: 65.50, change24h: -0.95 }
};

class MockCryptoService {
  private prices: Record<string, PriceData> = { ...INITIAL_PRICES };
  private subscribers: Map<string, Set<(data: PriceData) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize prices for all supported cryptos
    supportedCryptos.forEach(crypto => {
      if (!this.prices[crypto.symbol]) {
        this.prices[crypto.symbol] = {
          price: 100 + Math.random() * 900,
          change24h: -5 + Math.random() * 10
        };
      }
    });
  }

  private updatePrice(symbol: string) {
    const currentPrice = this.prices[symbol];
    if (!currentPrice) return;

    // Simulate price movement
    const priceChange = currentPrice.price * (Math.random() * 0.002 - 0.001);
    const newPrice = currentPrice.price + priceChange;
    
    // Update 24h change
    const changeAdjustment = (Math.random() * 0.2 - 0.1);
    let newChange = currentPrice.change24h + changeAdjustment;
    newChange = Math.max(Math.min(newChange, 10), -10); // Keep within ±10%

    this.prices[symbol] = {
      price: newPrice,
      change24h: newChange
    };

    // Notify subscribers
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => callback(this.prices[symbol]));
    }
  }

  subscribe(symbol: string, callback: (data: PriceData) => void): () => void {
    // Initialize subscriber set if it doesn't exist
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }

    // Add subscriber
    this.subscribers.get(symbol)!.add(callback);

    // Start price updates if not already running
    if (!this.intervals.has(symbol)) {
      const interval = setInterval(() => this.updatePrice(symbol), 1000);
      this.intervals.set(symbol, interval);
    }

    // Immediately send current price
    callback(this.prices[symbol]);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        
        // If no more subscribers, clear the interval
        if (subscribers.size === 0) {
          const interval = this.intervals.get(symbol);
          if (interval) {
            clearInterval(interval);
            this.intervals.delete(symbol);
          }
          this.subscribers.delete(symbol);
        }
      }
    };
  }

  getCurrentPrice(symbol: string): PriceData {
    return this.prices[symbol] || { price: 0, change24h: 0 };
  }
}

export const mockCryptoService = new MockCryptoService();