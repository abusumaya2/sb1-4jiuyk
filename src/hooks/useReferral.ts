import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  getReferralStats,
  generateReferralCode,
  applyReferralCode
} from '../lib/firebase/referrals';
import { toast } from 'react-hot-toast';

export function useReferral() {
  const { user } = useStore();
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadReferralData = async () => {
      try {
        const stats = await getReferralStats(user.uid);
        setReferralStats(stats);
      } catch (error) {
        console.error('Error loading referral data:', error);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();

    // Set up real-time listener for referral notifications
    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/notifications`),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const notification = change.doc.data();
            if (notification.type === 'referral_bonus') {
              toast.success(`Earned ${notification.amount} HUST from referral!`);
            } else if (notification.type === 'new_referral') {
              toast.success('New referral joined! Earned 100 HUST bonus!');
            }
          }
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  const generateNewReferralCode = async () => {
    if (!user) return null;

    try {
      const code = await generateReferralCode(user.uid);
      toast.success('New referral code generated!');
      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
      return null;
    }
  };

  const applyCode = async (code: string) => {
    if (!user) return false;

    try {
      const success = await applyReferralCode(user.uid, code);
      if (success) {
        toast.success('Referral code applied! You received 100 HUST bonus!');
        // Refresh stats after applying code
        const stats = await getReferralStats(user.uid);
        setReferralStats(stats);
      } else {
        toast.error('Invalid referral code');
      }
      return success;
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
      return false;
    }
  };

  return {
    referralStats,
    loading,
    generateNewReferralCode,
    applyCode
  };
}