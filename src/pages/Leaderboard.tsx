import React, { useState, useEffect } from 'react';
import { Trophy, Percent, ListOrdered, Coins } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeaderCard } from '../components/LeaderCard';

type SortType = 'points' | 'winRate' | 'orders';

interface FilterOption {
  id: SortType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const FILTERS: FilterOption[] = [
  {
    id: 'points',
    label: 'PTS',
    icon: <Coins size={20} />,
    description: 'Most points earned'
  },
  {
    id: 'winRate',
    label: 'Win Rate',
    icon: <Percent size={20} />,
    description: 'Highest win rate'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ListOrdered size={20} />,
    description: 'Most orders completed'
  }
];

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('points');

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        // Query users with at least 1 trade
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('totalTrades', '>', 0),
          orderBy('totalTrades', 'desc'),
          limit(100)
        );
        
        const snapshot = await getDocs(q);
        const leaderData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const totalTrades = (data.wins || 0) + (data.losses || 0);
          const winRate = totalTrades > 0 
            ? ((data.wins / totalTrades) * 100) 
            : 0;

          return {
            id: doc.id,
            displayName: data.displayName,
            points: data.points || 0,
            wins: data.wins || 0,
            losses: data.losses || 0,
            totalTrades,
            winRate,
            miningStreak: data.miningStreak || 0,
            totalMined: data.totalMined || 0
          };
        });

        // Sort based on selected criteria
        const sortedLeaders = leaderData.sort((a, b) => {
          switch (sortBy) {
            case 'winRate':
              return b.winRate - a.winRate || b.totalTrades - a.totalTrades;
            case 'orders':
              return b.totalTrades - a.totalTrades || b.winRate - a.winRate;
            case 'points':
            default:
              return b.points - a.points || b.winRate - a.winRate;
          }
        }).map((leader, index) => ({
          ...leader,
          rank: index + 1
        }));
        
        setLeaders(sortedLeaders);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-[#13141b]">
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-[420px] space-y-4">
          {/* Header */}
          <div className="bg-[#1E2028] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Top Traders</h1>
                <p className="text-sm text-gray-400 mt-1">
                  All-time best traders
                </p>
              </div>
              <Trophy className="text-yellow-400" size={28} />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSortBy(filter.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                    sortBy === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2d2d3d] text-gray-400 hover:bg-[#3d3d4d] hover:text-white'
                  }`}
                >
                  {filter.icon}
                  <span className="text-xs mt-1">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1E2028] p-4 rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))
            ) : leaders.length > 0 ? (
              leaders.map((leader) => (
                <LeaderCard
                  key={leader.id}
                  rank={leader.rank}
                  name={leader.displayName}
                  winRate={leader.winRate}
                  trades={leader.totalTrades}
                  points={leader.points}
                  streak={leader.miningStreak}
                  totalMined={leader.totalMined}
                  showMiningStats={true}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No active traders yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}