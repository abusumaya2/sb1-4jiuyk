import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { applyReferralCode } from './referrals';
import { toast } from 'react-hot-toast';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.message.includes('Quota exceeded')) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

export async function createUser(
  uid: string,
  telegramId: number,
  displayName: string,
  username?: string,
  isAdmin: boolean = false
) {
  try {
    return await runTransaction(db, async (transaction) => {
      // Check if user already exists
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists()) {
        throw new Error('User already exists');
      }

      // Initialize user data
      const userData = {
        uid,
        telegramId,
        displayName,
        username,
        isAdmin,
        points: 2000,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalTrades: 0,
        dailyStreak: 0,
        miningStreak: 0,
        miningPower: 100,
        totalMined: 0,
        totalReferrals: 0,
        totalReferralEarnings: 0,
        lastLoginDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create user document
      transaction.set(userRef, userData);

      // Initialize leaderboard document
      const allTimeRef = doc(db, 'leaderboard/all-time/users', uid);
      transaction.set(allTimeRef, {
        uid,
        displayName,
        username,
        points: 2000,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalTrades: 0,
        updatedAt: serverTimestamp()
      });

      return userData;
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      if (error.message.includes('User already exists')) {
        throw new Error('Account already exists');
      }
      throw new Error('Failed to create user account');
    }
    throw error;
  }
}

export async function getUserByTelegramId(telegramId: number) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', telegramId));
    const snapshot = await retryOperation(() => getDocs(q));

    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...userData
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user by Telegram ID:', error);
    throw new Error('Failed to retrieve user data');
  }
}