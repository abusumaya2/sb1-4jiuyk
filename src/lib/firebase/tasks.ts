import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  serverTimestamp,
  increment,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import * as Icons from 'lucide-react';

export interface GameTaskCondition {
  type: 'mining_streak' | 'mining_daily' | 'referrals' | 'trades';
  target: number;
  current?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'limited' | 'ingame' | 'partner';
  reward: number;
  icon: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
  progress?: number;
  total?: number;
  status: 'available' | 'active' | 'completed' | 'claimed';
  userId?: string;
  link?: string;
  linkType?: string;
  condition?: GameTaskCondition;
}

// Check if a task's conditions are met
async function checkTaskConditions(userId: string, task: Task): Promise<boolean> {
  if (!task.condition) return false;

  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return false;

  const userData = userDoc.data();

  switch (task.condition.type) {
    case 'mining_streak':
      return userData.miningStreak >= task.condition.target;
    
    case 'mining_daily':
      const miningRef = doc(db, 'mining', userId);
      const miningDoc = await getDoc(miningRef);
      if (!miningDoc.exists()) return false;
      const miningData = miningDoc.data();
      return miningData.dailyMiningCount >= task.condition.target;
    
    case 'referrals':
      return (userData.totalReferrals || 0) >= task.condition.target;
    
    case 'trades':
      return (userData.totalTrades || 0) >= task.condition.target;
    
    default:
      return false;
  }
}

export async function getUserTasks(userId: string) {
  try {
    const tasksRef = collection(db, 'tasks');
    const userTasksRef = collection(db, `users/${userId}/tasks`);
    
    const [availableTasks, userTasks] = await Promise.all([
      getDocs(query(tasksRef, where('status', '==', 'available'))),
      getDocs(userTasksRef)
    ]);

    const tasks: Task[] = [];
    const userTaskIds = new Set(userTasks.docs.map(doc => doc.id));

    // Add available tasks that user hasn't started
    for (const doc of availableTasks.docs) {
      if (!userTaskIds.has(doc.id)) {
        const task = doc.data() as Task;
        
        // For in-game tasks, check conditions
        if (task.type === 'ingame' && task.condition) {
          const isCompleted = await checkTaskConditions(userId, task);
          if (isCompleted) {
            task.status = 'completed';
          }
        }

        tasks.push({
          ...task,
          id: doc.id,
          icon: task.icon || 'Star'
        });
      }
    }

    // Add user's active and completed tasks
    userTasks.forEach(doc => {
      const task = doc.data() as Task;
      tasks.push({
        ...task,
        id: doc.id,
        icon: task.icon || 'Star'
      });
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export async function startTask(userId: string, taskId: string) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }

    const task = taskDoc.data() as Task;
    if (task.status !== 'available') {
      throw new Error('Task is not available');
    }

    // For in-game tasks, check if conditions are met
    if (task.type === 'ingame' && task.condition) {
      const isCompleted = await checkTaskConditions(userId, task);
      if (isCompleted) {
        task.status = 'completed';
      }
    }

    const userTaskRef = doc(db, `users/${userId}/tasks`, taskId);
    await setDoc(userTaskRef, {
      ...task,
      userId,
      status: task.status,
      startTime: serverTimestamp(),
      endTime: task.type === 'limited' ? 
        Timestamp.fromMillis(Date.now() + (task.duration || 3600) * 1000) :
        null
    });

    return true;
  } catch (error) {
    console.error('Error starting task:', error);
    throw error;
  }
}

export async function claimTaskReward(userId: string, taskId: string) {
  try {
    const userTaskRef = doc(db, `users/${userId}/tasks`, taskId);
    const taskDoc = await getDoc(userTaskRef);

    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }

    const task = taskDoc.data() as Task;
    if (task.status !== 'completed') {
      throw new Error('Task is not completed');
    }

    // Update user points and task status
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      points: increment(task.reward),
      updatedAt: serverTimestamp()
    });

    await updateDoc(userTaskRef, {
      status: 'claimed',
      claimedAt: serverTimestamp()
    });

    return task.reward;
  } catch (error) {
    console.error('Error claiming task reward:', error);
    throw error;
  }
}

export async function checkTaskCompletion(userId: string, taskId: string) {
  try {
    const userTaskRef = doc(db, `users/${userId}/tasks`, taskId);
    const taskDoc = await getDoc(userTaskRef);

    if (!taskDoc.exists()) return false;

    const task = taskDoc.data() as Task;
    if (task.status !== 'active') return false;

    // For in-game tasks, check conditions
    if (task.type === 'ingame' && task.condition) {
      const isCompleted = await checkTaskConditions(userId, task);
      if (isCompleted) {
        await updateDoc(userTaskRef, {
          status: 'completed',
          completedAt: serverTimestamp()
        });
        return true;
      }
      return false;
    }

    // For limited time tasks, check time
    const now = Date.now();
    const endTime = task.endTime?.toMillis() || 0;

    if (now >= endTime) {
      await updateDoc(userTaskRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking task completion:', error);
    return false;
  }
}

export async function deleteUserTask(userId: string, taskId: string) {
  try {
    const userTaskRef = doc(db, `users/${userId}/tasks`, taskId);
    await deleteDoc(userTaskRef);
    return true;
  } catch (error) {
    console.error('Error deleting user task:', error);
    throw error;
  }
}