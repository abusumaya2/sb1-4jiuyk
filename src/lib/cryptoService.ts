import { supportedCryptos } from './cryptoList';

interface PriceData {
  price: number;
  change24h: number;
}

class CryptoService {
  private static instance: CryptoService;
  private prices: Map<string, PriceData> = new Map();
  private subscribers: Map<string, Set<(data: PriceData) => void>> = new Map();
  private sockets: Map<string, WebSocket> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (CryptoService.instance) {
      return CryptoService.instance;
    }
    CryptoService.instance = this;
  }

  private async fetchPrice(symbol: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent)
      };
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  private setupWebSocket(symbol: string) {
    if (this.sockets.get(symbol)?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
      // Clear any reconnect timers
      const timer = this.reconnectTimers.get(symbol);
      if (timer) {
        clearTimeout(timer);
        this.reconnectTimers.delete(symbol);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const priceData: PriceData = {
          price: parseFloat(data.c),
          change24h: parseFloat(data.P)
        };

        this.prices.set(symbol, priceData);
        this.notifySubscribers(symbol, priceData);
      } catch (error) {
        console.error(`Error processing WebSocket message for ${symbol}:`, error);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for ${symbol}`);
      this.handleReconnect(symbol);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
      ws.close();
    };

    this.sockets.set(symbol, ws);
  }

  private handleReconnect(symbol: string) {
    // Clear existing socket
    this.sockets.delete(symbol);

    // Set up reconnection timer
    const timer = setTimeout(() => {
      console.log(`Attempting to reconnect WebSocket for ${symbol}`);
      this.setupWebSocket(symbol);
    }, 5000);

    this.reconnectTimers.set(symbol, timer);
  }

  private notifySubscribers(symbol: string, data: PriceData) {
    const subscribers = this.subscribers.get(symbol);
    if (!subscribers) return;

    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in subscriber callback for ${symbol}:`, error);
      }
    });
  }

  async subscribe(symbol: string, callback: (data: PriceData) => void): Promise<() => void> {
    // Initialize subscribers set if it doesn't exist
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }

    const subscribers = this.subscribers.get(symbol)!;
    subscribers.add(callback);

    // If we already have a price, send it immediately
    const currentPrice = this.prices.get(symbol);
    if (currentPrice) {
      callback(currentPrice);
    } else {
      // Fetch initial price
      const initialPrice = await this.fetchPrice(symbol);
      if (initialPrice) {
        this.prices.set(symbol, initialPrice);
        callback(initialPrice);
      }
    }

    // Set up WebSocket connection
    this.setupWebSocket(symbol);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        
        // If no more subscribers, clean up
        if (subscribers.size === 0) {
          const ws = this.sockets.get(symbol);
          if (ws) {
            ws.close();
            this.sockets.delete(symbol);
          }
          this.subscribers.delete(symbol);
          this.prices.delete(symbol);
          
          const timer = this.reconnectTimers.get(symbol);
          if (timer) {
            clearTimeout(timer);
            this.reconnectTimers.delete(symbol);
          }
        }
      }
    };
  }

  getCurrentPrice(symbol: string): PriceData {
    return this.prices.get(symbol) || { price: 0, change24h: 0 };
  }
}

export const cryptoService = new CryptoService();