import React from 'react';
import { Trophy, Clock } from 'lucide-react';

interface LeaderboardTabsProps {
  active: 'season' | 'all-time';
  onChange: (type: 'season' | 'all-time') => void;
}

export function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  return (
    <div className="bg-[#1E2028] p-2 rounded-lg grid grid-cols-2 gap-2">
      <button
        onClick={() => onChange('season')}
        className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
          active === 'season'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Clock size={20} />
        <span className="font-medium">Season</span>
      </button>
      
      <button
        onClick={() => onChange('all-time')}
        className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
          active === 'all-time'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Trophy size={20} />
        <span className="font-medium">All Time</span>
      </button>
    </div>
  );
}