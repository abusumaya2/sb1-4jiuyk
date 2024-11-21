import React from 'react';
import { Rocket } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#13141b]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <Rocket size={48} className="mx-auto mb-4 text-blue-400" />
          <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
          <p className="text-gray-400">New features are on the way!</p>
        </div>
      </div>
    </div>
  );
}