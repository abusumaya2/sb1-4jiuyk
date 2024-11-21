import React from 'react';
import { Coins } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  className?: string;
}

export function PointsDisplay({ points, className = '' }: PointsDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coins className="text-yellow-400" size={20} />
      <span className="font-bold">{points.toLocaleString()}</span>
    </div>
  );
}