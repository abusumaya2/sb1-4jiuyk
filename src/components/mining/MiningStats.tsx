import React from 'react';
import { Trophy, Zap, Coins, Flame } from 'lucide-react';

interface MiningStatsProps {
  streak: number;
  miningPower: number;
  totalMined: number;
  streakBonus: number;
}

export function MiningStats({
  streak,
  miningPower,
  totalMined,
  streakBonus
}: MiningStatsProps) {
  return (
    <div className="bg-[#1E2028] rounded-lg p-4">
      <h2 className="font-bold mb-4">Mining Stats</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Flame size={16} className="text-orange-400" />
            <span>Mining Streak</span>
          </div>
          <div className="text-lg font-bold">
            {streak} days
          </div>
          {streakBonus > 1 && (
            <div className="text-sm text-orange-400">
              +{Math.round((streakBonus - 1) * 100)}% bonus
            </div>
          )}
        </div>

        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Zap size={16} className="text-blue-400" />
            <span>Power Level</span>
          </div>
          <div className="text-lg font-bold">
            Level {Math.floor(miningPower / 10)}
          </div>
          <div className="text-sm text-blue-400">
            {miningPower.toFixed(2)} PTS/hour
          </div>
        </div>

        <div className="col-span-2 bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Coins size={16} className="text-yellow-400" />
            <span>Total Mined</span>
          </div>
          <div className="text-lg font-bold">
            {totalMined.toFixed(2)} PTS
          </div>
        </div>
      </div>
    </div>
  );
}