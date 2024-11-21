import React from 'react';
import { Gift, ChevronRight, Check } from 'lucide-react';

interface MiningRewardsProps {
  streak: number;
}

export function MiningRewards({ streak }: MiningRewardsProps) {
  const rewards = [
    { days: 7, bonus: 500, multiplier: 1.25 },
    { days: 30, bonus: 2500, multiplier: 1.5 },
    { days: 90, bonus: 10000, multiplier: 1.75 },
    { days: 180, bonus: 25000, multiplier: 2.0 },
    { days: 365, bonus: 100000, multiplier: 2.5 }
  ];

  return (
    <div className="bg-[#1E2028] rounded-lg p-4">
      <h2 className="font-bold mb-4">Mining Milestones</h2>
      
      <div className="space-y-2">
        {rewards.map((reward) => {
          const isAchieved = streak >= reward.days;
          const isNext = !isAchieved && streak < reward.days;
          
          return (
            <div
              key={reward.days}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isAchieved
                  ? 'bg-green-900/20'
                  : isNext
                  ? 'bg-blue-900/20'
                  : 'bg-[#2d2d3d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isAchieved
                    ? 'bg-green-600/20'
                    : isNext
                    ? 'bg-blue-600/20'
                    : 'bg-purple-600/20'
                }`}>
                  {isAchieved ? (
                    <Check size={20} className="text-green-400" />
                  ) : (
                    <Gift size={20} className={
                      isNext ? 'text-blue-400' : 'text-purple-400'
                    } />
                  )}
                </div>
                <div>
                  <p className="font-medium">{reward.days} Day Streak</p>
                  <div className="text-sm space-x-2">
                    <span className="text-yellow-400">
                      +{reward.bonus.toLocaleString()} HUST
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-orange-400">
                      {Math.round((reward.multiplier - 1) * 100)}% bonus
                    </span>
                  </div>
                </div>
              </div>
              {isNext && (
                <div className="text-sm text-blue-400">
                  {reward.days - streak} days left
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}