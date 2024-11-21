import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { validateTelegramWebApp, initializeAuth } from '../lib/firebase/auth';
import { useUserData } from '../hooks/useUserData';
import { toast } from 'react-hot-toast';
import { WifiOff } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setPoints, setDailyStreak } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Initialize real-time data sync
  useUserData();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Retry authentication when coming back online
      if (error) {
        setError(null);
        setRetryCount(0);
        setIsLoading(true);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const authenticate = async () => {
      try {
        // Validate Telegram WebApp environment
        if (!window.Telegram?.WebApp) {
          throw new Error('Please open this app through Telegram');
        }

        // Wait for and validate Telegram WebApp
        const telegramUser = await validateTelegramWebApp();

        if (!mounted) return;

        // Initialize authentication
        const authResult = await initializeAuth(telegramUser);

        if (!mounted) return;

        // Update application state
        setUser(authResult.user);
        setPoints(authResult.points);
        setDailyStreak(authResult.dailyStreak);

        if (authResult.isNewUser) {
          toast.success('Welcome to Web3 Trading Game! 🎉');
        }

        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error('Authentication error:', error);
        if (!mounted) return;

        if (retryCount < MAX_RETRIES && navigator.onLine) {
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(authenticate, 2000 * Math.pow(2, retryCount));
        } else {
          setError(error instanceof Error ? error.message : 'Failed to authenticate');
          setIsLoading(false);
        }
      }
    };

    authenticate();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [setUser, setPoints, setDailyStreak, retryCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#13141b]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyMCAyNDBjNjYuMjc0IDAgMTIwLTUzLjcyNiAxMjAtMTIwUzE4Ni4yNzQgMCAxMjAgMCAwIDUzLjcyNiAwIDEyMHM1My43MjYgMTIwIDEyMCAxMjB6IiBmaWxsPSIjMkI2REYzIi8+PHBhdGggZD0iTTEyMCAyNDBjNjYuMjc0IDAgMTIwLTUzLjcyNiAxMjAtMTIwUzE4Ni4yNzQgMCAxMjAgMCAwIDUzLjcyNiAwIDEyMHM1My43MjYgMTIwIDEyMCAxMjB6IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iMTIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjI0MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiMyQjZERjMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyQjZERjMiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==" 
              alt="Loading"
              className="w-full h-full animate-bounce"
            />
          </div>
          <p className="text-gray-400">
            {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#13141b] text-center">
        <div className="w-24 h-24 mb-4">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyMCAyNDBjNjYuMjc0IDAgMTIwLTUzLjcyNiAxMjAtMTIwUzE4Ni4yNzQgMCAxMjAgMCAwIDUzLjcyNiAwIDEyMHM1My43MjYgMTIwIDEyMCAxMjB6IiBmaWxsPSIjMkI2REYzIi8+PHBhdGggZD0iTTEyMCAyNDBjNjYuMjc0IDAgMTIwLTUzLjcyNiAxMjAtMTIwUzE4Ni4yNzQgMCAxMjAgMCAwIDUzLjcyNiAwIDEyMHM1My43MjYgMTIwIDEyMCAxMjB6IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iMTIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjI0MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiMyQjZERjMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyQjZERjMiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==" 
            alt="Error"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">Web3 Trading Game</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <a
          href="https://t.me/cryptohustlee_bot/game"
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

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-2 text-center text-sm z-50 flex items-center justify-center gap-2">
          <WifiOff size={16} />
          <span>You are currently offline. Some features may be limited.</span>
        </div>
      )}
      {children}
    </>
  );
}