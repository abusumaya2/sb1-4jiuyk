import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Trophy, User, Pickaxe, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStore();

  const isActive = (path: string) => {
    if (path === '/trading' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#13141b] text-white flex flex-col">
      {/* Admin Header */}
      {user?.isAdmin && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center">
          <button
            onClick={() => navigate('/admin/tasks')}
            className="flex items-center gap-2 mx-auto"
          >
            <Settings size={16} />
            <span>Task Manager</span>
          </button>
        </div>
      )}

      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1E2028] border-t border-gray-800 safe-bottom z-50">
        <div className="flex justify-around items-center h-14">
          <button
            onClick={() => navigate('/trading')}
            className="flex flex-col items-center text-xs active-state touch-target"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <TrendingUp size={20} className={isActive('/trading') ? 'text-blue-400' : 'text-gray-400'} />
            <span className={isActive('/trading') ? 'text-blue-400' : 'text-gray-400'}>Trade</span>
          </button>
          
          <button
            onClick={() => navigate('/mining')}
            className="flex flex-col items-center text-xs active-state touch-target"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Pickaxe size={20} className={isActive('/mining') ? 'text-blue-400' : 'text-gray-400'} />
            <span className={isActive('/mining') ? 'text-blue-400' : 'text-gray-400'}>Mine</span>
          </button>
          
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex flex-col items-center text-xs active-state touch-target"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Trophy size={20} className={isActive('/leaderboard') ? 'text-blue-400' : 'text-gray-400'} />
            <span className={isActive('/leaderboard') ? 'text-blue-400' : 'text-gray-400'}>Leaders</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center text-xs active-state touch-target"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <User size={20} className={isActive('/profile') ? 'text-blue-400' : 'text-gray-400'} />
            <span className={isActive('/profile') ? 'text-blue-400' : 'text-gray-400'}>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}