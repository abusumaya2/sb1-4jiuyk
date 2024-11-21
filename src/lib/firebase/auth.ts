import { doc, getDoc, setDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { createUser, getUserByTelegramId } from './users';
import { applyReferralCode } from './referrals';
import { toast } from 'react-hot-toast';
import queryString from 'query-string';

// Admin Telegram ID
const ADMIN_TELEGRAM_ID = 393543160; // Replace with the actual Telegram ID

type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      username?: string;
    };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

export async function validateTelegramWebApp(): Promise<{
  id: number;
  first_name: string;
  username?: string;
  referralCode?: string;
}> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = 500;

    const checkWebApp = () => {
      if (!window.Telegram?.WebApp) {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Please open this app through Telegram'));
        } else {
          setTimeout(checkWebApp, checkInterval);
        }
        return;
      }

      const { WebApp } = window.Telegram;
      const user = WebApp.initDataUnsafe.user;

      if (!user?.id) {
        reject(new Error('Please open this app through Telegram'));
        return;
      }

      try {
        WebApp.ready();
        WebApp.expand();

        // Get referral code from URL or start_param
        let referralCode = WebApp.initDataUnsafe.start_param;
        
        // Check URL parameters for referral code
        const parsed = queryString.parse(window.location.search);
        if (parsed.startapp && typeof parsed.startapp === 'string') {
          referralCode = parsed.startapp;
        }

        resolve({
          id: user.id,
          first_name: user.first_name,
          username: user.username,
          referralCode
        });
      } catch (error) {
        console.warn('Non-critical WebApp initialization error:', error);
        resolve({
          id: user.id,
          first_name: user.first_name,
          username: user.username
        });
      }
    };

    checkWebApp();
  });
}

export async function initializeAuth(telegramUser: {
  id: number;
  first_name: string;
  username?: string;
  referralCode?: string;
}) {
  try {
    const userId = `tg${telegramUser.id}`;
    const isAdmin = telegramUser.id === ADMIN_TELEGRAM_ID;

    // Check if user exists with retry logic
    const existingUser = await retryOperation(() => getUserByTelegramId(telegramUser.id));

    if (existingUser) {
      // Update existing user with retry
      return await retryOperation(async () => {
        return await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', existingUser.id);
          const userDoc = await transaction.get(userRef);

          if (!userDoc.exists()) {
            throw new Error('User document not found');
          }

          // Update user data
          transaction.update(userRef, {
            displayName: telegramUser.first_name,
            username: telegramUser.username,
            isAdmin, // Update admin status
            lastLoginDate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          const userData = userDoc.data();
          return {
            user: {
              uid: existingUser.id,
              telegramId: telegramUser.id,
              displayName: telegramUser.first_name,
              username: telegramUser.username,
              isAdmin
            },
            points: userData.points || 2000,
            wins: userData.wins || 0,
            losses: userData.losses || 0,
            winRate: userData.winRate || 0,
            totalTrades: userData.totalTrades || 0,
            dailyStreak: userData.dailyStreak || 0,
            isNewUser: false
          };
        });
      });
    }

    // Create new user with retry
    const userData = await retryOperation(() => 
      createUser(
        userId,
        telegramUser.id,
        telegramUser.first_name,
        telegramUser.username,
        isAdmin
      )
    );

    // Apply referral code if provided
    if (telegramUser.referralCode) {
      await applyReferralCode(userId, telegramUser.referralCode);
    }

    return {
      user: {
        uid: userId,
        telegramId: telegramUser.id,
        displayName: telegramUser.first_name,
        username: telegramUser.username,
        isAdmin
      },
      points: userData.points || 2000,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalTrades: 0,
      dailyStreak: 0,
      isNewUser: true
    };
  } catch (error) {
    console.error('Auth initialization error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Quota exceeded')) {
        toast.error('Server is busy, please try again in a few minutes');
      } else if (error.message.includes('Permission denied')) {
        toast.error('Access denied. Please try again');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error('Failed to initialize account. Please try again');
      }
    }
    throw error;
  }
}