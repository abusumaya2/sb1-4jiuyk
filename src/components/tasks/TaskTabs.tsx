import React from 'react';

interface TaskTabsProps {
  activeTab: 'limited' | 'ingame' | 'partners';
  onTabChange: (tab: 'limited' | 'ingame' | 'partners') => void;
  counts: {
    limited: number;
    ingame: number;
    partners: number;
  };
}

export function TaskTabs({ activeTab, onTabChange, counts }: TaskTabsProps) {
  return (
    <div className="flex gap-2 mb-4 bg-[#1E2028] p-1 rounded-lg">
      <button
        onClick={() => onTabChange('limited')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'limited'
            ? 'bg-[#2d2d3d] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Limited
        {counts.limited > 0 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {counts.limited}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange('ingame')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'ingame'
            ? 'bg-[#2d2d3d] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        In-game
        {counts.ingame > 0 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {counts.ingame}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange('partners')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'partners'
            ? 'bg-[#2d2d3d] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Partners
        {counts.partners > 0 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {counts.partners}
          </span>
        )}
      </button>
    </div>
  );
}