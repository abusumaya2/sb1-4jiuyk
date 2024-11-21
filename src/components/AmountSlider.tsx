import React from 'react';
import { Coins } from 'lucide-react';

const AMOUNTS = [50, 100, 150, 200];

interface AmountSliderProps {
  value: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
}

export function AmountSlider({ value, onChange, disabled = false }: AmountSliderProps) {
  const currentIndex = AMOUNTS.indexOf(value);
  const percentage = (currentIndex / (AMOUNTS.length - 1)) * 100;

  return (
    <div className="space-y-4 px-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Amount</span>
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-yellow-400" />
          <span className="font-bold">{value} PTS</span>
        </div>
      </div>

      <div className="relative py-4">
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2 rounded-full" />
        
        {/* Active track */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full" 
          style={{ width: `${percentage}%` }}
        />

        {/* Amount markers */}
        {AMOUNTS.map((amount, index) => {
          const position = (index / (AMOUNTS.length - 1)) * 100;
          return (
            <div
              key={amount}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${position}%` }}
            >
              <div className={`w-3 h-3 rounded-full transition-colors ${
                value >= amount 
                  ? 'bg-blue-500' 
                  : 'bg-gray-700'
              }`} />
            </div>
          );
        })}

        {/* Slider thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -ml-3"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 shadow-lg" />
        </div>

        {/* Hidden range input for touch interaction */}
        <input
          type="range"
          min={0}
          max={AMOUNTS.length - 1}
          value={currentIndex}
          onChange={(e) => onChange(AMOUNTS[Number(e.target.value)])}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer touch-target"
          style={{ height: '44px', marginTop: '-12px' }}
        />
      </div>

      {/* Amount labels */}
      <div className="flex justify-between">
        {AMOUNTS.map((amount) => (
          <span 
            key={amount}
            className={`text-xs ${
              value >= amount ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {amount}
          </span>
        ))}
      </div>
    </div>
  );
}