import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { processReferralBonus } from '../lib/firebase/referrals';

const MINING_DURATION = 3 * 60 * 60; // 3 hours in seconds
const BASE_MINING_RATE = 100; // Base rate PTS per hour

export function calculateMiningPower(level: number): number {
  if (level <= 10) return BASE_MINING_RATE * (1 + level * 0.1);
  if (level <= 20) return BASE_MINING_RATE * (1 + level * 0.2);
  return BASE_MINING_RATE * (1 + level * 0.3);
}

export function useMining() {
  const { user, points, setPoints } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const loadLastClaimTime = async () => {
      const miningRef = doc(db, 'mining', user.uid);
      const miningDoc = await getDoc(miningRef);

      if (miningDoc.exists()) {
        const data = miningDoc.data();
        if (data.lastClaimTime) {
          setLastClaimTime(data.lastClaimTime);
        }
      }
    };

    loadLastClaimTime();
  }, [user]);

  // Update timer every second
  useEffect(() => {
    if (!lastClaimTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceClaim = Math.floor((now - lastClaimTime) / 1000);
      const timeLeft = Math.max(0, MINING_DURATION - timeSinceClaim);
      setTimeUntilNextClaim(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastClaimTime]);

  const handleStartMining = async () => {
    if (!user) {
      toast.error('Please sign in to start mining');
      return false;
    }

    if (isProcessing) {
      return false;
    }

    try {
      setIsProcessing(true);
      const miningRef = doc(db, 'mining', user.uid);
      const miningDoc = await getDoc(miningRef);

      if (miningDoc.exists()) {
        const data = miningDoc.data();
        if (data.miningStartTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - data.miningStartTime) / 1000);
          if (elapsed < MINING_DURATION) {
            toast.error('Mining is already in progress');
            return false;
          }
        }
      }

      await setDoc(miningRef, {
        userId: user.uid,
        miningStartTime: Date.now(),
        miningPower: BASE_MINING_RATE,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success('Mining started!');
      return true;
    } catch (error) {
      console.error('Error starting mining:', error);
      toast.error('Failed to start mining');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const canClaim = timeUntilNextClaim === 0;

  const handleClaimRewards = async () => {
    if (!user) {
      toast.error('Please sign in to claim rewards');
      return false;
    }

    if (isProcessing || !canClaim) {
      return false;
    }

    try {
      setIsProcessing(true);

      const result = await runTransaction(db, async (transaction) => {
        const miningRef = doc(db, 'mining', user.uid);
        const miningDoc = await transaction.get(miningRef);

        if (!miningDoc.exists()) {
          throw new Error('No mining data found');
        }

        const data = miningDoc.data();
        
        // Calculate rewards based on mining power and time
        const miningPower = data.miningPower || BASE_MINING_RATE;
        const reward = miningPower * 3; // 3 hours reward

        // Update mining document
        transaction.update(miningRef, {
          miningStartTime: null,
          totalMined: increment(reward),
          lastClaimTime: Date.now(),
          updatedAt: serverTimestamp()
        });

        // Update user points
        const userRef = doc(db, 'users', user.uid);
        transaction.update(userRef, {
          points: increment(reward),
          updatedAt: serverTimestamp()
        });

        return { reward };
      });

      // Update local state
      setPoints(points + result.reward);
      setLastClaimTime(Date.now());

      // Process referral bonus
      await processReferralBonus(user.uid, result.reward, 'mining');

      toast.success(`Claimed ${result.reward} PTS!`);
      return true;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to claim rewards');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleStartMining,
    handleClaimRewards,
    isProcessing,
    timeUntilNextClaim,
    canClaim,
    lastClaimTime
  };
}