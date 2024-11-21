import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { 
  collection, 
  doc, 
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { processReferralBonus } from '../lib/firebase/referrals';

export type Timeframe = '15m' | '1h' | '4h' | '1d';

interface TimeframeConfig {
  label: string;
  duration: number;
  minAmount: number;
}

export const TIMEFRAMES: Record<Timeframe, TimeframeConfig> = {
  '15m': { label: '15 Min', duration: 15 * 60 * 1000, minAmount: 50 },
  '1h': { label: '1 Hour', duration: 60 * 60 * 1000, minAmount: 50 },
  '4h': { label: '4 Hours', duration: 4 * 60 * 60 * 1000, minAmount: 50 },
  '1d': { label: '1 Day', duration: 24 * 60 * 60 * 1000, minAmount: 50 }
};

export function useTrading() {
  const { user, points } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const isTimeframeLocked = async (timeframe: Timeframe): Promise<boolean> => {
    if (!user) return true;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', user.uid),
      where('timeframe', '==', timeframe),
      where('status', 'in', ['active', 'ready_to_claim'])
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const getTimeframeEndTime = (timeframe: Timeframe) => {
    return Date.now() + TIMEFRAMES[timeframe].duration;
  };

  const executeTrade = async (
    type: 'buy' | 'sell',
    amount: number,
    price: number,
    symbol: string,
    timeframe: Timeframe
  ): Promise<{ success: boolean; message: string }> => {
    if (isProcessing) {
      return { success: false, message: 'Trade is already processing' };
    }

    if (!user) {
      return { success: false, message: 'Please sign in to trade' };
    }

    if (points < amount) {
      return { success: false, message: 'Insufficient funds' };
    }

    if (amount < TIMEFRAMES[timeframe].minAmount) {
      return { 
        success: false, 
        message: `Minimum amount is ${TIMEFRAMES[timeframe].minAmount} PTS` 
      };
    }

    const locked = await isTimeframeLocked(timeframe);
    if (locked) {
      return { 
        success: false, 
        message: `You already have an active order for ${TIMEFRAMES[timeframe].label}` 
      };
    }

    setIsProcessing(true);

    try {
      const endTime = getTimeframeEndTime(timeframe);
      const orderRef = doc(collection(db, 'orders'));
      
      // Create the order
      await setDoc(orderRef, {
        id: orderRef.id,
        userId: user.uid,
        symbol,
        type,
        timeframe,
        entryPrice: price,
        amount,
        status: 'active',
        createdAt: serverTimestamp(),
        endTime
      });

      // Process referral bonus for trading
      try {
        await processReferralBonus(user.uid, amount, 'trading');
      } catch (error) {
        console.error('Error processing referral bonus:', error);
      }

      return {
        success: true,
        message: `${type === 'buy' ? 'Long' : 'Short'} position opened for ${TIMEFRAMES[timeframe].label}`
      };
    } catch (error) {
      console.error('Error executing trade:', error);
      return {
        success: false,
        message: 'Failed to execute trade'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executeTrade,
    isProcessing,
    isTimeframeLocked,
    TIMEFRAMES
  };
}