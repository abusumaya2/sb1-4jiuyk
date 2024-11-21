import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction,
  collection
} from 'firebase/firestore';
import { db } from '../firebase';
import { miningCollection } from './collections';
import type { Mining } from './schema';

const BASE_MINING_RATE = 100; // 100 PTS per hour = 300 PTS per 3 hours

export async function initializeMining(userId: string): Promise<Mining> {
  const miningRef = doc(miningCollection, userId);
  const miningDoc = await getDoc(miningRef);

  if (!miningDoc.exists()) {
    const initialData: Omit<Mining, 'createdAt' | 'updatedAt'> = {
      userId,
      lastMiningClaim: 0,
      miningStreak: 0,
      miningPower: BASE_MINING_RATE,
      totalMined: 0,
      miningStartTime: null
    };

    await setDoc(miningRef, {
      ...initialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      ...initialData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Mining;
  }

  return miningDoc.data() as Mining;
}

export async function getMiningStatus(userId: string) {
  const miningRef = doc(miningCollection, userId);
  const miningDoc = await getDoc(miningRef);

  if (!miningDoc.exists()) return null;

  return {
    miningStartTime: miningDoc.data().miningStartTime || null
  };
}

export async function startMining(userId: string): Promise<void> {
  const miningRef = doc(miningCollection, userId);
  
  await updateDoc(miningRef, {
    miningStartTime: Date.now(),
    updatedAt: serverTimestamp()
  });
}

export async function claimMiningRewards(
  userId: string,
  reward: number,
  newStreak: number
): Promise<void> {
  const miningRef = doc(miningCollection, userId);
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const miningDoc = await transaction.get(miningRef);
    const userDoc = await transaction.get(userRef);

    if (!miningDoc.exists() || !userDoc.exists()) {
      throw new Error('Mining or user document not found');
    }

    // Update mining document
    transaction.update(miningRef, {
      lastMiningClaim: Date.now(),
      miningStreak: newStreak,
      totalMined: increment(reward),
      miningStartTime: null,
      updatedAt: serverTimestamp()
    });

    // Update user points
    transaction.update(userRef, {
      points: increment(reward),
      updatedAt: serverTimestamp()
    });

    // Create mining history record
    const historyRef = doc(collection(db, `mining/${userId}/history`));
    transaction.set(historyRef, {
      reward,
      streak: newStreak,
      timestamp: serverTimestamp()
    });
  });
}