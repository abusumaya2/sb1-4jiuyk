import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DAILY_BONUS_SCHEDULE = [
  100,  // Day 1
  200,  // Day 2
  300,  // Day 3
  500,  // Day 4
  700,  // Day 5
  1000, // Day 6
  1500  // Day 7
];

export function usePoints() {
  const { user, points, dailyStreak, setPoints, setDailyStreak } = useStore();

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      const userDoc = doc(db, 'users', user.uid);
      const userData = await getDoc(userDoc);

      if (!userData.exists()) {
        // Initialize new user
        await setDoc(userDoc, {
          points: 0,
          dailyStreak: 0,
          lastLoginDate: null
        });
      } else {
        setPoints(userData.data().points);
        setDailyStreak(userData.data().dailyStreak);
        checkDailyBonus(userDoc, userData.data());
      }
    };

    loadUserData();
  }, [user, setPoints, setDailyStreak]);

  const checkDailyBonus = async (userDoc: any, userData: any) => {
    const today = new Date().toDateString();
    const lastLogin = userData.lastLoginDate?.toDate().toDateString();

    if (today === lastLogin) return;

    const isConsecutiveDay = lastLogin === new Date(Date.now() - 86400000).toDateString();
    const newStreak = isConsecutiveDay ? Math.min(userData.dailyStreak + 1, 7) : 1;
    const bonus = DAILY_BONUS_SCHEDULE[newStreak - 1];

    await updateDoc(userDoc, {
      points: userData.points + bonus,
      dailyStreak: newStreak,
      lastLoginDate: new Date()
    });

    setPoints(userData.points + bonus);
    setDailyStreak(newStreak);

    return bonus;
  };

  const addPoints = async (amount: number) => {
    if (!user) return;

    const userDoc = doc(db, 'users', user.uid);
    await updateDoc(userDoc, {
      points: points + amount
    });
    setPoints(points + amount);
  };

  const spendPoints = async (amount: number): Promise<boolean> => {
    if (!user || points < amount) return false;

    const userDoc = doc(db, 'users', user.uid);
    await updateDoc(userDoc, {
      points: points - amount
    });
    setPoints(points - amount);
    return true;
  };

  return { addPoints, spendPoints };
}