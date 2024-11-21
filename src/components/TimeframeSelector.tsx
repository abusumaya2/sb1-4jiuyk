import React from 'react';
import { Clock } from 'lucide-react';
import { Timeframe, TIMEFRAMES } from '../hooks/useTrading';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
  isLocked: (timeframe: Timeframe) => boolean;
}

export function TimeframeSelector({ 
  selectedTimeframe, 
  onSelect,
  isLocked 
}: TimeframeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(Object.entries(TIMEFRAMES) as [Timeframe, typeof TIMEFRAMES[Timeframe]][]).map(
        ([timeframe, config]) => {
          const locked = isLocked(timeframe);
          
          return (
            <button
              key={timeframe}
              onClick={() => !locked && onSelect(timeframe)}
              disabled={locked}
              className={`p-3 rounded-lg text-center relative active-state touch-target ${
                locked
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2d2d3d] text-gray-400 hover:bg-[#3d3d4d]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex flex-col items-center gap-1">
                <Clock size={16} />
                <span className="text-xs font-medium">{config.label}</span>
              </div>
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg backdrop-blur-[1px]">
                  <span className="text-xs font-medium">Locked</span>
                </div>
              )}
            </button>
          );
        }
      )}
    </div>
  );
}