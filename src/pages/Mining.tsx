import React, { useState, useEffect } from 'react';
import { Pickaxe, Timer, Gift, Rocket, Zap, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useMining } from '../hooks/useMining';
import { TaskCard } from '../components/tasks/TaskCard';
import { TasksSection } from '../components/tasks/TasksSection';
import { TaskTabs } from '../components/tasks/TaskTabs';
import { getUserTasks, startTask, claimTaskReward, deleteUserTask } from '../lib/firebase/tasks';
import { toast } from 'react-hot-toast';

export function Mining() {
  const { user } = useStore();
  const [isMining, setIsMining] = useState(false);
  const [activeTab, setActiveTab] = useState<'limited' | 'ingame' | 'partners'>('limited');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { 
    handleStartMining, 
    handleClaimRewards, 
    isProcessing,
    timeUntilNextClaim,
    canClaim 
  } = useMining();

  // Load tasks on component mount
  useEffect(() => {
    if (!user) return;
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getUserTasks(user!.uid);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load mining status on component mount
  useEffect(() => {
    if (!user) return;

    const loadMiningStatus = async () => {
      const miningRef = doc(db, 'mining', user.uid);
      const miningDoc = await getDoc(miningRef);
      
      if (miningDoc.exists()) {
        const data = miningDoc.data();
        if (data.miningStartTime) {
          setIsMining(true);
        }
      }
    };

    loadMiningStatus();
  }, [user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  };

  const startMining = async () => {
    if (isMining || isProcessing) return;
    
    const success = await handleStartMining();
    if (success) {
      setIsMining(true);
    }
  };

  const claimRewards = async () => {
    if (!canClaim || isProcessing) return;

    const success = await handleClaimRewards();
    if (success) {
      setIsMining(false);
    }
  };

  // Task data based on active tab
  const getTasksForTab = () => {
    if (loading) return [];
    return tasks.filter(task => task.type === activeTab);
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await startTask(user!.uid, taskId);
      toast.success('Task started!');
      loadTasks();
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      const reward = await claimTaskReward(user!.uid, taskId);
      toast.success(`Claimed ${reward} PTS!`);
      loadTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
      toast.error('Failed to claim reward');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteUserTask(user!.uid, taskId);
      toast.success('Task removed');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to remove task');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#13141b]">
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-[420px] space-y-4">
          {/* Mining Hub Card with Integrated Controls */}
          <div className="bg-[#1E2028] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Mining Hub</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Mine PTS every 3 hours
                </p>
              </div>
              {!isMining ? (
                <button
                  onClick={startMining}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold active-state disabled:opacity-50"
                >
                  <Pickaxe size={20} />
                  {isProcessing ? 'Starting...' : 'Start Mining'}
                </button>
              ) : canClaim ? (
                <button
                  onClick={claimRewards}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 font-bold animate-pulse active-state disabled:opacity-50"
                >
                  <Gift size={20} />
                  {isProcessing ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-700 text-gray-400 rounded-lg flex items-center gap-2 font-bold cursor-not-allowed"
                >
                  <Timer size={20} />
                  Mining...
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Timer size={16} />
                  <span>Time Until Next Claim</span>
                </div>
                <div className="font-bold">
                  {timeUntilNextClaim > 0 ? formatTime(timeUntilNextClaim) : 'Ready to claim!'}
                </div>
              </div>

              <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000"
                  style={{ 
                    width: `${((3 * 60 * 60 - timeUntilNextClaim) / (3 * 60 * 60)) * 100}%` 
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Pickaxe size={16} />
                  <span>Mining Rate</span>
                </div>
                <div className="font-bold text-yellow-400">
                  300 PTS/3h
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Tabs */}
          <TaskTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              limited: tasks.filter(t => t.type === 'limited').length,
              ingame: tasks.filter(t => t.type === 'ingame').length,
              partners: tasks.filter(t => t.type === 'partners').length
            }}
          />

          {/* Tasks List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-[#2d2d3d] rounded-lg p-4 animate-pulse">
                  <div className="h-20"></div>
                </div>
              ))
            ) : getTasksForTab().length > 0 ? (
              getTasksForTab().map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onStart={() => handleStartTask(task.id)}
                  onClaim={() => handleClaimTask(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No tasks available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}