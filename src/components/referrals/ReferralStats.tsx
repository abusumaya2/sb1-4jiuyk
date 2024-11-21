import React from 'react';
import { Users, Coins, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getReferralLink } from '../../lib/firebase/referrals';

interface ReferralStatsProps {
  totalReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

export function ReferralStats({ totalReferrals, totalEarnings, referralCode }: ReferralStatsProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    const referralLink = getReferralLink(referralCode);
    const text = `Join Web3 Trading Game and get 1000 PTS welcome bonus!\n${referralLink}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          toast.success('Referral link copied!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  return (
    <div className="bg-[#1E2028] rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Users size={16} className="text-blue-400" />
            <span>Total Referrals</span>
          </div>
          <div className="text-lg font-bold">{totalReferrals}</div>
        </div>

        <div className="bg-[#2d2d3d] p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Coins size={16} className="text-yellow-400" />
            <span>Total Earnings</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {totalEarnings.toFixed(2)} PTS
          </div>
        </div>
      </div>

      <div className="bg-[#2d2d3d] p-3 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#13141b] px-3 py-2 rounded font-mono">
            {referralCode}
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg active-state"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}