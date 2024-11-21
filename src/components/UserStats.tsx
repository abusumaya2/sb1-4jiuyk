import React from 'react';
import { Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';

export function UserStats() {
  const { points = 0, wins = 0, losses = 0 } = useStore();
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(2) : '0.00';

  // Format points with proper decimal places and thousands separator
  const formattedPoints = typeof points === 'number' 
    ? points.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    : '0.00';

  return (
    <div>
      {/* Balance */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-yellow-400">
          {formattedPoints}
        </div>
        <div className="text-sm text-gray-400">Total Balance</div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{wins}</div>
          <div className="text-xs text-gray-400">Wins</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{losses}</div>
          <div className="text-xs text-gray-400">Losses</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400">{winRate}%</div>
          <div className="text-xs text-gray-400">Win Rate</div>
        </div>
      </div>
    </div>
  );
}