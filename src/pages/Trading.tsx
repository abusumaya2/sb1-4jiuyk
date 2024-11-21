import React, { useState, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CryptoSelector } from '../components/CryptoSelector';
import { TradingViewWidget } from '../components/TradingViewWidget';
import { ActiveOrders } from '../components/ActiveOrders';
import { TimeframeSelector } from '../components/TimeframeSelector';
import { AmountSlider } from '../components/AmountSlider';
import { useCryptoPrice } from '../hooks/useCryptoPrice';
import { useTrading, Timeframe } from '../hooks/useTrading';
import { UserStats } from '../components/UserStats';
import { toast } from 'react-hot-toast';

export function Trading() {
  const { points } = useStore();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('15m');
  const [amount, setAmount] = useState(50);
  const { price, change24h, loading } = useCryptoPrice(selectedSymbol);
  const { executeTrade, isProcessing, isTimeframeLocked, TIMEFRAMES } = useTrading();

  const [timeframeLocks, setTimeframeLocks] = useState<Record<Timeframe, boolean>>({
    '15m': false,
    '1h': false,
    '4h': false,
    '1d': false
  });

  const checkTimeframeLocks = useCallback(async () => {
    const locks: Record<Timeframe, boolean> = {
      '15m': false,
      '1h': false,
      '4h': false,
      '1d': false
    };

    await Promise.all(
      Object.keys(TIMEFRAMES).map(async (timeframe) => {
        locks[timeframe as Timeframe] = await isTimeframeLocked(timeframe as Timeframe);
      })
    );

    setTimeframeLocks(locks);
  }, [isTimeframeLocked]);

  React.useEffect(() => {
    checkTimeframeLocks();
  }, [checkTimeframeLocks]);

  const handleSymbolChange = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (points < amount) {
      toast.error('Insufficient funds');
      return;
    }

    if (loading || price === 0) {
      toast.error('Please wait for price data to load');
      return;
    }

    try {
      const result = await executeTrade(
        type, 
        amount,
        price, 
        selectedSymbol,
        selectedTimeframe
      );

      if (result.success) {
        toast.success(result.message);
        checkTimeframeLocks();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error('Failed to execute trade');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#13141b]">
      {/* Stats Card */}
      <div className="p-4">
        <div className="max-w-[420px] mx-auto">
          <div className="bg-[#1E2028] rounded-lg p-4 mb-4">
            <UserStats />
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-[420px] mx-auto flex-1">
          {/* Crypto Selection Card */}
          <div className="bg-[#1E2028] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <CryptoSelector
                  selectedSymbol={selectedSymbol}
                  onSelect={handleSymbolChange}
                />
              </div>
              <div className="text-right">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 w-32 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-sm ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-[#1E2028] rounded-lg overflow-hidden mb-4">
            <div className="h-[300px]">
              <TradingViewWidget 
                symbol={selectedSymbol}
                theme="dark"
              />
            </div>
          </div>

          {/* Trading Controls Card */}
          <div className="bg-[#1E2028] rounded-lg p-4 mb-4 space-y-4">
            <TimeframeSelector
              selectedTimeframe={selectedTimeframe}
              onSelect={setSelectedTimeframe}
              isLocked={(timeframe) => timeframeLocks[timeframe]}
            />

            <AmountSlider
              value={amount}
              onChange={setAmount}
              disabled={isProcessing || loading}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTrade('buy')}
                disabled={isProcessing || loading || timeframeLocks[selectedTimeframe] || points < amount}
                className="flex items-center justify-center gap-2 bg-[#26a69a] text-white p-4 rounded-lg font-bold disabled:opacity-50 active-state"
              >
                <ArrowUpCircle size={20} />
                Buy {selectedSymbol}
              </button>
              <button
                onClick={() => handleTrade('sell')}
                disabled={isProcessing || loading || timeframeLocks[selectedTimeframe] || points < amount}
                className="flex items-center justify-center gap-2 bg-[#ef5350] text-white p-4 rounded-lg font-bold disabled:opacity-50 active-state"
              >
                <ArrowDownCircle size={20} />
                Sell {selectedSymbol}
              </button>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-[#1E2028] rounded-lg p-4 mb-4">
            <ActiveOrders currentSymbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}