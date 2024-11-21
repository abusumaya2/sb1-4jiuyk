import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { cryptoService } from '../lib/cryptoService';
import { useOrders } from '../hooks/useOrders';
import { toast } from 'react-hot-toast';
import { OrderCard } from './OrderCard';

interface ActiveOrdersProps {
  currentSymbol: string;
}

type Order = {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  exitPrice?: number | null;
  status: 'active' | 'ready_to_claim' | 'completed';
  timestamp: number;
  endTime: number;
};

interface OrderGroup {
  readyToClaim: Order[];
  active: Order[];
}

export function ActiveOrders({ currentSymbol }: ActiveOrdersProps) {
  const { activeOrders } = useStore();
  const { claimOrder } = useOrders();
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Subscribe to price updates for all unique symbols in orders
  useEffect(() => {
    if (!activeOrders || activeOrders.length === 0) {
      setLoading(false);
      return;
    }

    const symbols = [...new Set(activeOrders.map(order => order.symbol))];
    const subscriptions: Record<string, () => void> = {};
    let mounted = true;

    const setupSubscriptions = async () => {
      setLoading(true);
      
      for (const symbol of symbols) {
        try {
          const unsubscribe = await cryptoService.subscribe(symbol, (data) => {
            if (!mounted) return;
            setCurrentPrices(prev => ({
              ...prev,
              [symbol]: data.price
            }));
          });
          subscriptions[symbol] = unsubscribe;
        } catch (error) {
          console.error(`Error subscribing to ${symbol}:`, error);
          toast.error(`Failed to get price for ${symbol}`);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      Object.values(subscriptions).forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      });
    };
  }, [activeOrders]);

  // Group orders by status
  const groupedOrders = activeOrders.reduce<OrderGroup>(
    (acc, order) => {
      if (order.status === 'ready_to_claim') {
        acc.readyToClaim.push(order);
      } else if (order.status === 'active') {
        acc.active.push(order);
      }
      return acc;
    },
    { readyToClaim: [], active: [] }
  );

  const handleClaim = async (order: Order) => {
    try {
      const currentPrice = currentPrices[order.symbol];
      if (!currentPrice) {
        toast.error('Unable to get current price. Please try again.');
        return;
      }
      await claimOrder(order.id, order.amount, order.exitPrice || currentPrice);
    } catch (error) {
      console.error('Error claiming order:', error);
      toast.error('Failed to claim order');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#1E2028] rounded-lg p-4 h-[200px]" />
        ))}
      </div>
    );
  }

  if (!activeOrders || activeOrders.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No active orders
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ready to Claim Orders */}
      {groupedOrders.readyToClaim.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Ready to Claim</h3>
          {groupedOrders.readyToClaim.map((order) => (
            <OrderCard
              key={order.id}
              {...order}
              onClaim={() => handleClaim(order)}
            />
          ))}
        </div>
      )}

      {/* Active Orders */}
      {groupedOrders.active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Active Orders</h3>
          {groupedOrders.active.map((order) => (
            <OrderCard
              key={order.id}
              {...order}
              exitPrice={currentPrices[order.symbol] || null}
            />
          ))}
        </div>
      )}
    </div>
  );
}