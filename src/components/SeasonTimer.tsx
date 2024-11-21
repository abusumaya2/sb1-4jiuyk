import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function SeasonTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set season end date to the last day of current month
    const now = new Date();
    const seasonEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = seasonEnd.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#2d2d3d] rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Clock size={16} />
        <span className="text-sm">Season ends in</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.days}</div>
          <div className="text-xs text-gray-400">days</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs text-gray-400">hours</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-400">min</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-400">sec</div>
        </div>
      </div>
    </div>
  );
}