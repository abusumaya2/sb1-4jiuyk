import React from 'react';
import { Trophy, Pickaxe, ListOrdered, Percent } from 'lucide-react';

interface LeaderCardProps {
  rank: number;
  name: string;
  winRate: number;
  trades: number;
  points: number;
  streak: number;
  totalMined?: number;
  showMiningStats?: boolean;
}

export function LeaderCard({
  rank,
  name,
  winRate,
  trades,
  points,
  streak,
  totalMined = 0,
  showMiningStats = false
}: LeaderCardProps) {
  const getRankDisplay = () => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-xl font-bold">#{rank}</span>;
    }
  };

  const getBackgroundColor = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-900/20 to-yellow-600/20';
      case 2:
        return 'bg-gradient-to-r from-gray-800/40 to-gray-600/40';
      case 3:
        return 'bg-gradient-to-r from-orange-900/20 to-orange-700/20';
      default:
        return 'bg-[#1E2028]';
    }
  };

  return (
    <div className={`${getBackgroundColor()} p-4 rounded-lg`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2d2d3d]">
          {getRankDisplay()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-yellow-400 font-bold">{points.toFixed(2)} PTS</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <Percent size={14} className="text-green-400" />
              <span className="text-green-400">{winRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ListOrdered size={14} className="text-blue-400" />
              <span className="text-blue-400">{trades}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Pickaxe size={14} className="text-orange-400" />
                <span className="text-orange-400">{streak}d</span>
              </div>
            )}
          </div>

          {showMiningStats && totalMined > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              Total Mined: <span className="text-yellow-400">{totalMined.toFixed(2)} PTS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}