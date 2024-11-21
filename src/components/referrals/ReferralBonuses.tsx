import React from 'react';
import { Gift, ArrowUpCircle, Pickaxe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { claimReferralBonuses } from '../../lib/firebase/referrals';
import { useStore } from '../../store/useStore';

interface ReferralBonusesProps {
  pendingBonuses: {
    mining: number;
    trading: number;
  } | null;
  onClaim: () => void;
}

export function ReferralBonuses({ pendingBonuses, onClaim }: ReferralBonusesProps) {
  const { user } = useStore();
  const [claiming, setClaiming] = React.useState(false);

  // Safely calculate total pending with null checks
  const totalPending = pendingBonuses ? 
    (pendingBonuses.mining || 0) + (pendingBonuses.trading || 0) : 
    0;

  const handleClaim = async () => {
    if (claiming || totalPending === 0 || !pendingBonuses || !user) return;
    
    try {
      setClaiming(true);
      await claimReferralBonuses(user.uid);
      onClaim();
      toast.success(`Claimed ${totalPending.toFixed(2)} PTS from referrals!`);
    } catch (error) {
      console.error('Error claiming bonuses:', error);
      toast.error('Failed to claim bonuses');
    } finally {
      setClaiming(false);
    }
  };

  // Show loading state if pendingBonuses is null
  if (!pendingBonuses) {
    return (
      <div className="bg-[#1E2028] rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#2d2d3d] rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-[#2d2d3d] rounded"></div>
            <div className="h-24 bg-[#2d2d3d] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2028] rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Pending Bonuses</h3>
        {totalPending > 0 && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-full text-sm font-medium active-state disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : `Claim ${totalPending.toFixed(2)} PTS`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Pickaxe size={16} className="text-blue-400" />
            <span>Mining (10%)</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {pendingBonuses.mining.toFixed(2)} PTS
          </div>
        </div>

        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <ArrowUpCircle size={16} className="text-green-400" />
            <span>Trading (5%)</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {pendingBonuses.trading.toFixed(2)} PTS
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p className="flex items-center gap-2">
          <Gift size={16} className="text-purple-400" />
          Earn from your referrals' activities
        </p>
      </div>
    </div>
  );
}