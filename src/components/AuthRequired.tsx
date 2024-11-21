import React from 'react';
import { useStore } from '../store/useStore';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthRequired({ children, requireAdmin = false }: AuthRequiredProps) {
  const { user } = useStore();
  const navigate = useNavigate();

  // Check if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#13141b] text-center">
        <Bot size={48} className="text-blue-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Web3 Trading Game</h1>
        <p className="text-gray-400 mb-6">
          Please open this app through Telegram to start trading
        </p>
        <a
          href="https://t.me/cryptohustlee_bot?start=webapp"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Open in Telegram
        </a>
        <p className="text-sm text-gray-500 mt-4">
          This app can only be accessed through the Telegram bot
        </p>
      </div>
    );
  }

  // Check if admin access is required but user is not admin
  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#13141b] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}