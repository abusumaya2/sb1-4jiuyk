import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

// Collection references with types
export const usersCollection = collection(db, 'users') as CollectionReference<DocumentData>;
export const ordersCollection = collection(db, 'orders') as CollectionReference<DocumentData>;
export const miningCollection = collection(db, 'mining') as CollectionReference<DocumentData>;
export const leaderboardCollection = collection(db, 'leaderboard') as CollectionReference<DocumentData>;
export const referralsCollection = collection(db, 'referrals') as CollectionReference<DocumentData>;

// Collection paths for security rules
export const COLLECTION_PATHS = {
  USERS: 'users',
  ORDERS: 'orders',
  MINING: 'mining',
  LEADERBOARD: 'leaderboard',
  REFERRALS: 'referrals',
  ORDER_HISTORY: (userId: string) => `users/${userId}/orderHistory`,
  MINING_HISTORY: (userId: string) => `mining/${userId}/history`,
  LEADERBOARD_USERS: (type: string) => `leaderboard/${type}/users`
} as const;