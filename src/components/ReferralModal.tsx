import React, { useState, useEffect } from 'react';
import { Share2, X, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { getReferralStats, getReferralLink } from '../lib/firebase/referrals';

interface ReferralModalProps {
  onClose: () => void;
}

const REFERRAL_BONUS = 1000;

export function ReferralModal({ onClose }: ReferralModalProps) {
  const { user } = useStore();
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const referralStats = await getReferralStats(user.uid);
        setStats(referralStats);
      } catch (error) {
        console.error('Error loading referral stats:', error);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const copyToClipboard = () => {
    if (!stats?.code) return;

    const referralLink = getReferralLink(stats.code);
    const text = `Join Web3 Trading Game and get ${REFERRAL_BONUS} PTS welcome bonus!\n${referralLink}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          toast.success('Referral link copied!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);

    try {
      textarea.select();
      document.execCommand('copy');
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const shareToTelegram = () => {
    if (!stats?.code) return;

    const referralLink = getReferralLink(stats.code);
    const text = encodeURIComponent(
      `Join Web3 Trading Game and get ${REFERRAL_BONUS} PTS welcome bonus!`
    );
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E2028] rounded-lg w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Share & Earn</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2d2d3d] p-3 rounded-lg animate-pulse h-20" />
              <div className="bg-[#2d2d3d] p-3 rounded-lg animate-pulse h-20" />
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2d2d3d] p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Referrals</p>
                <p className="text-lg font-bold">{stats.totalReferrals}</p>
              </div>
              <div className="bg-[#2d2d3d] p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Earnings</p>
                <p className="text-lg font-bold text-yellow-400">
                  {stats.totalEarnings.toFixed(2)} PTS
                </p>
              </div>
            </div>
          )}

          <div className="bg-[#2d2d3d] p-3 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#13141b] px-3 py-2 rounded font-mono">
                {stats?.code || '...'}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg active-state"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 p-3 bg-[#2d2d3d] rounded-lg hover:bg-[#3d3d4d] active-state"
            >
              <Copy size={20} />
              Copy Link
            </button>
            <button
              onClick={shareToTelegram}
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg active-state"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>

          {!loading && stats?.history?.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full text-left text-sm text-gray-400 hover:text-white"
              >
                {showHistory ? 'Hide' : 'Show'} Referral History
              </button>

              {showHistory && (
                <div className="mt-2 space-y-2">
                  {stats.history.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-[#2d2d3d] p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400">
                            {new Date(item.createdAt.toDate()).toLocaleDateString()}
                          </p>
                          <p className="text-yellow-400">
                            +{item.amount.toFixed(2)} PTS
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.type === 'welcome' ? 'Welcome Bonus' :
                           item.type === 'mining' ? 'Mining Commission' :
                           'Trading Commission'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-400">
            <p>Earn rewards for each friend you invite:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>1000 PTS welcome bonus for both you and your friend</li>
              <li>10% commission on their mining rewards</li>
              <li>5% commission on their trading profits</li>
              <li>Maximum 100 active referrals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}