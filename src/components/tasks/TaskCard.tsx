import React, { useEffect, useState } from 'react';
import { LucideIcon, ExternalLink } from 'lucide-react';

interface TaskCardProps {
  title: string;
  description: string;
  reward: number;
  icon: React.ReactNode;
  timeLeft?: number;
  progress?: number;
  total?: number;
  status: 'available' | 'active' | 'completed';
  link?: string;
  linkType?: string;
  onStart?: () => void;
  onClaim?: () => void;
}

export function TaskCard({
  title,
  description,
  reward,
  icon,
  timeLeft,
  progress,
  total,
  status,
  link,
  linkType,
  onStart,
  onClaim
}: TaskCardProps) {
  const [remainingTime, setRemainingTime] = useState(timeLeft || 0);

  useEffect(() => {
    if (!timeLeft || status !== 'active') return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (link) {
      window.open(link, '_blank');
    }
    if (onStart) {
      onStart();
    }
  };

  return (
    <div className="bg-[#2d2d3d] rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E2028] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <div className="text-yellow-400 font-bold">
          {reward.toLocaleString()} PTS
        </div>
      </div>

      {/* Progress or Timer */}
      {(progress !== undefined && total !== undefined) && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span>{progress}/{total}</span>
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-blue-600"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {status === 'active' && remainingTime > 0 && (
        <div className="text-center font-mono text-lg mb-4">
          {formatTime(remainingTime)}
        </div>
      )}

      {/* Action Button */}
      {status === 'available' && onStart && (
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium active-state flex items-center justify-center gap-2 touch-target"
        >
          Start Task
          {link && <ExternalLink size={16} />}
        </button>
      )}

      {status === 'completed' && onClaim && (
        <button
          onClick={onClaim}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium active-state touch-target"
        >
          Claim Reward
        </button>
      )}

      {status === 'active' && (
        <div className="text-sm text-blue-400 text-center">
          Task in progress...
        </div>
      )}
    </div>
  );
}