import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OrderCardProps {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  entryPrice: number;
  exitPrice: number | null;
  status: 'active' | 'ready_to_claim' | 'completed';
  timestamp: number;
  endTime: number;
  timeframe: string;
  onClaim?: () => void;
}

export function OrderCard({
  type,
  symbol,
  amount,
  entryPrice,
  exitPrice,
  status,
  timestamp,
  endTime,
  timeframe,
  onClaim
}: OrderCardProps) {
  const now = Date.now();
  const timeLeft = Math.max(0, endTime - now);
  const isReadyToClaim = status === 'ready_to_claim';
  
  const calculatePoints = () => {
    if (!exitPrice || status === 'active') return null;
    
    const priceDiff = exitPrice - entryPrice;
    const isWin = (type === 'buy' && priceDiff > 0) || 
                 (type === 'sell' && priceDiff < 0);
    
    return isWin ? amount : -amount;
  };

  const points = calculatePoints();

  const formatTime = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getPriceChangeColor = () => {
    if (!exitPrice || exitPrice === entryPrice) return 'text-white';
    const priceDiff = exitPrice - entryPrice;
    const isProfit = (type === 'buy' && priceDiff > 0) || 
                    (type === 'sell' && priceDiff < 0);
    return isProfit ? 'text-green-400' : 'text-red-400';
  };

  const getPriceChange = () => {
    if (!exitPrice) return '';
    const change = ((exitPrice - entryPrice) / entryPrice) * 100;
    return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  // Get order type specific styles
  const getOrderStyles = () => {
    if (type === 'buy') {
      return {
        border: 'border-[#26a69a]/20',
        bg: 'bg-[#26a69a]/5',
        icon: 'text-[#26a69a]',
        gradient: 'from-[#26a69a]/10 to-transparent'
      };
    }
    return {
      border: 'border-[#ef5350]/20',
      bg: 'bg-[#ef5350]/5',
      icon: 'text-[#ef5350]',
      gradient: 'from-[#ef5350]/10 to-transparent'
    };
  };

  const styles = getOrderStyles();

  return (
    <div className={`relative border ${styles.border} ${styles.bg} rounded-lg p-4 overflow-hidden`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {type === 'buy' ? (
              <ArrowUpCircle className={styles.icon} size={20} />
            ) : (
              <ArrowDownCircle className={styles.icon} size={20} />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold">{symbol}/USDT</span>
                <span className="text-xs text-gray-400">{timeframe}</span>
              </div>
              {status === 'ready_to_claim' && (
                <span className="text-xs text-green-400">Ready to claim</span>
              )}
            </div>
          </div>
          {isReadyToClaim && onClaim && (
            <button
              onClick={onClaim}
              className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-full text-sm font-medium active-state"
            >
              Claim
            </button>
          )}
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Entry Price</div>
            <div className="font-bold">${entryPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Exit Price</div>
            <div className={`font-bold ${getPriceChangeColor()}`}>
              ${exitPrice ? exitPrice.toFixed(2) : '0.00'}
              {getPriceChange() && (
                <span className="ml-2 text-sm">({getPriceChange()})</span>
              )}
            </div>
          </div>
        </div>

        {/* Amount and Time */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Amount</span>
            <span className={`font-bold ${
              points ? (points > 0 ? 'text-green-400' : 'text-red-400') : 'text-yellow-400'
            }`}>
              {points ? `${points > 0 ? '+' : ''}${points.toFixed(2)}` : amount} PTS
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Order Date</span>
            <span className="text-sm">
              {format(timestamp, 'dd MMM yyyy, HH:mm')}
            </span>
          </div>

          {status === 'active' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Time Left</span>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}