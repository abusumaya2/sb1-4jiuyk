import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Share2, Award } from 'lucide-react';
import { ReferralModal } from '../components/ReferralModal';
import { PointsDisplay } from '../components/PointsDisplay';
import { ReferralStats } from '../components/referrals/ReferralStats';
import { ReferralBonuses } from '../components/referrals/ReferralBonuses';
import { getReferralStats } from '../lib/firebase/referrals';

export function Profile() {
  const { user, points, wins, losses, referralCode } = useStore();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(2) : '0.00';

  useEffect(() => {
    if (!user) return;

    const loadReferralData = async () => {
      try {
        setLoading(true);
        const data = await getReferralStats(user.uid);
        setReferralData(data);
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#13141b]">
        <div className="flex-1 flex justify-center p-4">
          <div className="w-full max-w-[420px] space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="bg-[#1E2028] rounded-lg p-6 h-48"></div>
              <div className="bg-[#1E2028] rounded-lg p-4 h-32"></div>
              <div className="bg-[#1E2028] rounded-lg p-4 h-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#13141b]">
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-[420px] space-y-4">
          {/* Profile Header */}
          <div className="bg-[#1E2028] rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#2d2d3d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">
                  {user?.displayName?.charAt(0) || '👤'}
                </span>
              </div>
              <h2 className="text-lg font-bold">{user?.displayName || 'Loading...'}</h2>
              {user?.username && (
                <p className="text-sm text-gray-400 mt-1">@{user.username}</p>
              )}
              <PointsDisplay points={points} className="justify-center mt-2" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#2d2d3d] p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-green-400">{wins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="bg-[#2d2d3d] p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-red-400">{losses}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
              <div className="bg-[#2d2d3d] p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-yellow-400">{winRate}%</p>
                <p className="text-xs text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          {referralData && (
            <>
              <ReferralStats
                totalReferrals={referralData.totalReferrals}
                totalEarnings={referralData.totalEarnings}
                referralCode={referralData.code}
              />
              
              <ReferralBonuses
                pendingBonuses={referralData.pendingBonuses}
                onClaim={() => {
                  // Refresh referral data after claiming
                  if (user) {
                    getReferralStats(user.uid).then(setReferralData);
                  }
                }}
              />
            </>
          )}
        </div>
      </div>

      {showReferralModal && (
        <ReferralModal
          code={referralCode}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
}