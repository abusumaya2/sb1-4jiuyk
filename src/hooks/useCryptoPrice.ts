import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface PriceData {
  price: number;
  change24h: number;
  loading: boolean;
}

export function useCryptoPrice(symbol: string): PriceData {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 0,
    change24h: 0,
    loading: true
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    // Reset state when symbol changes
    setPriceData({
      price: 0,
      change24h: 0,
      loading: true
    });

    // Fetch initial price
    const fetchInitialPrice = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (isSubscribed) {
          setPriceData({
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial price:', error);
        if (isSubscribed) {
          setPriceData(prev => ({ ...prev, loading: false }));
          toast.error('Failed to load price data');
        }
      }
    };

    // Setup WebSocket connection
    const setupWebSocket = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed) {
            setPriceData({
              price: parseFloat(data.c),
              change24h: parseFloat(data.P),
              loading: false
            });
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onerror = () => {
        console.error('WebSocket error occurred');
        if (ws) ws.close();
      };

      ws.onclose = () => {
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (isSubscribed) {
            setupWebSocket();
          }
        }, 5000);
      };
    };

    fetchInitialPrice();
    setupWebSocket();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (ws) {
        ws.close();
      }
    };
  }, [symbol]); // Re-run effect when symbol changes

  return priceData;
}