import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';

interface DailyBonusProps {
  streak: number;
  onClose: () => void;
}

export function DailyBonus({ streak, onClose }: DailyBonusProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg text-center animate-bounce">
        <Gift className="mx-auto mb-4 text-yellow-400" size={48} />
        <h2 className="text-xl font-bold mb-2">Daily Bonus!</h2>
        <p className="text-gray-400 mb-4">Day {streak} Streak</p>
        <div className="text-2xl font-bold text-yellow-400">
          +{streak === 7 ? '1500' : streak * 100} points
        </div>
      </div>
    </div>
  );
}