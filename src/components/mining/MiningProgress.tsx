import React from 'react';
import { Timer, Pickaxe, Flame } from 'lucide-react';

interface MiningProgressProps {
  isMining: boolean;
  timeLeft: number;
  miningPower: number;
  streak: number;
  streakBonus: number;
}

export function MiningProgress({
  isMining,
  timeLeft,
  miningPower,
  streak,
  streakBonus
}: MiningProgressProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  };

  const progress = ((3 * 60 * 60 - timeLeft) / (3 * 60 * 60)) * 100;

  return (
    <div className="space-y-4">
      {/* Mining Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Timer size={16} />
          <span>Time Remaining</span>
        </div>
        <div className="font-bold">
          {isMining ? formatTime(timeLeft) : '3h 0m 0s'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000"
          style={{ width: `${isMining ? progress : 0}%` }}
        />
      </div>

      {/* Mining Rate */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Pickaxe size={16} />
          <span>Mining Rate</span>
        </div>
        <div className="font-bold text-yellow-400">
          {miningPower} PTS/hour
        </div>
      </div>

      {/* Streak Bonus */}
      {streak > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Flame size={16} className="text-orange-400" />
            <span>Streak Bonus</span>
          </div>
          <div className="font-bold text-orange-400">
            +{Math.round((streakBonus - 1) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}