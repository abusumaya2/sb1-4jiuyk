import { Timestamp } from 'firebase/firestore';

// User related types
export interface User {
  uid: string;
  telegramId: number;
  displayName: string;
  username?: string;
  points: number;
  wins: number;
  losses: number;
  dailyStreak: number;
  lastLoginDate: Timestamp;
  referralCode?: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order related types
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  status: 'active' | 'completed' | 'cancelled';
  result?: 'win' | 'loss';
  profit?: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Mining related types
export interface Mining {
  userId: string;
  lastMiningClaim: number;
  miningStartTime?: number;
  miningStreak: number;
  miningPower: number;
  totalMined: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MiningHistory {
  id: string;
  userId: string;
  amount: number;
  streak: number;
  timestamp: Timestamp;
}

// Leaderboard related types
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  username?: string;
  points: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  rank: number;
  updatedAt: Timestamp;
}

// Referral related types
export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// Common types
export type Status = 'active' | 'completed' | 'cancelled';
export type TradeType = 'buy' | 'sell';
export type TradeResult = 'win' | 'loss';