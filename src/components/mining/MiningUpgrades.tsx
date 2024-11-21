import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';
import { calculateMiningPower } from '../../hooks/useMining';

const BASE_MINING_RATE = 100;

interface MiningUpgradesProps {
  miningPower: number;
  onUpgrade: (newPower: number) => void;
}

export function MiningUpgrades({ miningPower, onUpgrade }: MiningUpgradesProps) {
  const { points } = useStore();
  const currentLevel = Math.floor(miningPower / BASE_MINING_RATE);
  const isMaxLevel = currentLevel >= 30;
  
  const getNextLevelBonus = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= 10) return '10%';
    if (nextLevel <= 20) return '20%';
    return '30%';
  };

  const getUpgradeCost = () => {
    return Math.pow(currentLevel + 1, 2) * 1000;
  };

  const getNextLevelPower = () => {
    if (isMaxLevel) return miningPower;
    return calculateMiningPower(currentLevel + 1);
  };

  return (
    <div className="bg-[#1E2028] rounded-lg p-4">
      <h2 className="font-bold mb-4">Upgrades</h2>
      
      <button
        onClick={() => onUpgrade(getNextLevelPower())}
        disabled={isMaxLevel}
        className={`w-full flex items-center justify-between p-3 rounded-lg active-state ${
          isMaxLevel ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#2d2d3d]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <p className="font-medium">
              {isMaxLevel ? 'Maximum Level Reached' : 'Upgrade to Level ' + (currentLevel + 1)}
            </p>
            {!isMaxLevel && (
              <p className="text-sm text-gray-400">
                +{getNextLevelBonus()} ({getNextLevelPower()} PTS/hour)
              </p>
            )}
          </div>
        </div>
        {!isMaxLevel && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">
              {getUpgradeCost().toLocaleString()}
            </span>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        )}
      </button>

      {/* Level Progress */}
      <div className="mt-4 bg-[#2d2d3d] p-3 rounded-lg">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Level Progress</span>
          <span>{currentLevel}/30</span>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-blue-600"
            style={{ width: `${(currentLevel / 30) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Beginner</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>
    </div>
  );
}