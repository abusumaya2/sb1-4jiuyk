import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction,
  writeBatch,
  limit,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';

const REFERRAL_LIMIT = 100;
const REFERRAL_BONUS = 1000;
const MINING_COMMISSION = 0.10; // 10%
const TRADING_COMMISSION = 0.05; // 5%

function generateReferralCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = Array(2).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const suffix = nanoid(5).toUpperCase();
  return `${prefix}-${suffix}`;
}

export function getReferralLink(code: string): string {
  return `https://t.me/cryptohustlee_bot/app?startapp=${code}`;
}

export async function getReferralStats(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const pendingRef = doc(db, `users/${userId}/referralBonuses/pending`);
    
    const [userDoc, referralsSnapshot, pendingDoc] = await Promise.all([
      runTransaction(db, async (transaction) => {
        const doc = await transaction.get(userRef);
        if (!doc.exists()) throw new Error('User not found');

        if (!doc.data().referralCode) {
          const code = generateReferralCode();
          transaction.update(userRef, {
            referralCode: code,
            updatedAt: serverTimestamp()
          });
        }
        return doc;
      }),
      getDocs(query(
        collection(db, 'referrals'),
        where('referrerId', '==', userId),
        limit(100)
      )),
      getDoc(pendingRef)
    ]);

    const userData = userDoc.data();
    const referralHistory = referralsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get pending bonuses
    let pendingBonuses = { mining: 0, trading: 0 };
    if (pendingDoc.exists()) {
      const data = pendingDoc.data();
      pendingBonuses = {
        mining: data.mining || 0,
        trading: data.trading || 0
      };
    } else {
      // Initialize pending bonuses document if it doesn't exist
      await setDoc(pendingRef, {
        mining: 0,
        trading: 0,
        updatedAt: serverTimestamp()
      });
    }

    return {
      code: userData.referralCode,
      totalReferrals: userData.totalReferrals || 0,
      totalEarnings: userData.totalReferralEarnings || 0,
      pendingBonuses,
      history: referralHistory
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

export async function processReferralBonus(
  userId: string,
  amount: number,
  type: 'mining' | 'trading'
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(doc(db, 'users', userId));

      if (!userDoc.exists() || !userDoc.data().referrerId) return;

      const referrerId = userDoc.data().referrerId;
      const commission = type === 'mining' ? MINING_COMMISSION : TRADING_COMMISSION;
      const bonus = Math.floor(amount * commission);

      if (bonus <= 0) return;

      // Update pending bonuses
      const pendingRef = doc(db, `users/${referrerId}/referralBonuses/pending`);
      const pendingDoc = await transaction.get(pendingRef);

      if (pendingDoc.exists()) {
        transaction.update(pendingRef, {
          [type]: increment(bonus),
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(pendingRef, {
          [type]: bonus,
          updatedAt: serverTimestamp()
        });
      }

      // Create notification
      const notificationRef = doc(collection(db, `users/${referrerId}/notifications`));
      transaction.set(notificationRef, {
        type: 'referral_bonus',
        amount: bonus,
        bonusType: type,
        fromUser: userId,
        createdAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error processing referral bonus:', error);
  }
}

export async function claimReferralBonuses(userId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const pendingRef = doc(db, `users/${userId}/referralBonuses/pending`);
      const userRef = doc(db, 'users', userId);
      
      const pendingDoc = await transaction.get(pendingRef);
      if (!pendingDoc.exists()) return;

      const pendingBonuses = pendingDoc.data();
      const totalBonus = (pendingBonuses.mining || 0) + (pendingBonuses.trading || 0);

      if (totalBonus <= 0) return;

      // Update user points and stats
      transaction.update(userRef, {
        points: increment(totalBonus),
        totalReferralEarnings: increment(totalBonus),
        updatedAt: serverTimestamp()
      });

      // Clear pending bonuses
      transaction.update(pendingRef, {
        mining: 0,
        trading: 0,
        lastClaimed: serverTimestamp()
      });

      // Create bonus history record
      const historyRef = doc(collection(db, `users/${userId}/referralHistory`));
      transaction.set(historyRef, {
        amount: totalBonus,
        timestamp: serverTimestamp(),
        breakdown: {
          mining: pendingBonuses.mining || 0,
          trading: pendingBonuses.trading || 0
        }
      });
    });
  } catch (error) {
    console.error('Error claiming referral bonuses:', error);
    throw error;
  }
}

export async function applyReferralCode(userId: string, code: string): Promise<boolean> {
  try {
    return await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) throw new Error('User not found');
      if (userDoc.data().referrerId) {
        toast.error('You have already used a referral code');
        return false;
      }

      const usersRef = collection(db, 'users');
      const referrerQuery = query(
        usersRef,
        where('referralCode', '==', code),
        limit(1)
      );
      
      const referrerSnapshot = await getDocs(referrerQuery);
      if (referrerSnapshot.empty || referrerSnapshot.docs[0].id === userId) {
        toast.error('Invalid referral code');
        return false;
      }

      const referrerId = referrerSnapshot.docs[0].id;
      const referrerRef = doc(db, 'users', referrerId);
      const referrerDoc = await transaction.get(referrerRef);

      if (!referrerDoc.exists()) {
        toast.error('Referrer not found');
        return false;
      }

      if (referrerDoc.data().totalReferrals >= REFERRAL_LIMIT) {
        toast.error('Referrer has reached maximum referrals limit');
        return false;
      }

      // Update referred user
      transaction.update(userRef, {
        referrerId,
        points: increment(REFERRAL_BONUS),
        updatedAt: serverTimestamp()
      });

      // Update referrer
      transaction.update(referrerRef, {
        points: increment(REFERRAL_BONUS),
        totalReferrals: increment(1),
        totalReferralEarnings: increment(REFERRAL_BONUS),
        updatedAt: serverTimestamp()
      });

      // Create referral record
      const referralRef = doc(collection(db, 'referrals'));
      transaction.set(referralRef, {
        referrerId,
        referredId: userId,
        amount: REFERRAL_BONUS,
        type: 'welcome',
        status: 'completed',
        createdAt: serverTimestamp()
      });

      // Create notification for referrer
      const notificationRef = doc(collection(db, `users/${referrerId}/notifications`));
      transaction.set(notificationRef, {
        type: 'new_referral',
        referredId: userId,
        bonus: REFERRAL_BONUS,
        createdAt: serverTimestamp()
      });

      return true;
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return false;
  }
}