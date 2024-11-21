import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useUserData() {
  const { 
    user, 
    setPoints, 
    setWins, 
    setLosses, 
    setWinRate,
    setTotalTrades,
    syncWithFirebase 
  } = useStore();

  useEffect(() => {
    if (!user) return;

    // Subscribe to user document updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          
          // Sync all important user data
          syncWithFirebase({
            points: data.points,
            wins: data.wins,
            losses: data.losses,
            winRate: data.winRate,
            totalTrades: data.totalTrades,
            dailyStreak: data.dailyStreak,
            referralCode: data.referralCode
          });
        }
      },
      (error) => {
        console.error('Error syncing user data:', error);
      }
    );

    return () => unsubscribe();
  }, [user, setPoints, setWins, setLosses, setWinRate, setTotalTrades, syncWithFirebase]);
}