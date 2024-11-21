import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

// Admin Telegram ID
const ADMIN_TELEGRAM_ID = 393543160;

async function verifyAdmin(userId: string): Promise<boolean> {
  try {
    // Query users by Telegram ID
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', ADMIN_TELEGRAM_ID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return false;

    // Check if the user document matches the admin ID
    const userDoc = snapshot.docs[0];
    return userDoc.id === userId && userDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
}

export async function createTask(taskData: any) {
  try {
    // Get current user ID from taskData
    const { userId, ...data } = taskData;
    
    // Verify admin status
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...data,
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTask(taskId: string, taskData: any) {
  try {
    // Get current user ID from taskData
    const { userId, ...data } = taskData;
    
    // Verify admin status
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTask(taskId: string, userId: string) {
  try {
    // Verify admin status
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function getAllTasks(userId: string) {
  try {
    // Verify admin status
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}