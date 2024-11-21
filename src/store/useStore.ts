import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  uid: string;
  telegramId: number;
  displayName: string;
  username?: string;
  isAdmin?: boolean;
}

interface GameState {
  user: User | null;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
  totalTrades: number;
  dailyStreak: number;
  activeOrders: any[];
  referralCode?: string;
  setUser: (user: User | null) => void;
  setPoints: (points: number) => void;
  setWins: (wins: number) => void;
  setLosses: (losses: number) => void;
  setWinRate: (winRate: number) => void;
  setTotalTrades: (totalTrades: number) => void;
  addWin: () => void;
  addLoss: () => void;
  setDailyStreak: (streak: number) => void;
  addOrder: (order: any) => void;
  removeOrder: (orderId: string) => void;
  setOrders: (orders: any[]) => void;
  setReferralCode: (code: string) => void;
  syncWithFirebase: (data: Partial<GameState>) => void;
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      user: null,
      points: 2000,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalTrades: 0,
      dailyStreak: 0,
      activeOrders: [],
      setUser: (user) => set({ user }),
      setPoints: (points) => set({ points }),
      setWins: (wins) => set({ wins }),
      setLosses: (losses) => set({ losses }),
      setWinRate: (winRate) => set({ winRate }),
      setTotalTrades: (totalTrades) => set({ totalTrades }),
      addWin: () => set((state) => ({ 
        wins: state.wins + 1,
        totalTrades: state.totalTrades + 1,
        winRate: ((state.wins + 1) / (state.totalTrades + 1)) * 100
      })),
      addLoss: () => set((state) => ({ 
        losses: state.losses + 1,
        totalTrades: state.totalTrades + 1,
        winRate: (state.wins / (state.totalTrades + 1)) * 100
      })),
      setDailyStreak: (streak) => set({ dailyStreak: streak }),
      addOrder: (order) => set((state) => ({
        activeOrders: [
          ...state.activeOrders,
          {
            ...order,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            status: 'active'
          }
        ]
      })),
      removeOrder: (orderId) => set((state) => ({
        activeOrders: state.activeOrders.filter(order => order.id !== orderId)
      })),
      setOrders: (orders) => set({ activeOrders: orders }),
      setReferralCode: (code) => set({ referralCode: code }),
      syncWithFirebase: (data) => set((state) => ({
        ...state,
        ...data
      }))
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        points: state.points,
        wins: state.wins,
        losses: state.losses,
        winRate: state.winRate,
        totalTrades: state.totalTrades,
        dailyStreak: state.dailyStreak,
        referralCode: state.referralCode
      })
    }
  )
);