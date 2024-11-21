import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useOrders } from './useOrders';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

export function useRealtimeData() {
  const { user, updateMining } = useStore();
  useOrders(); // Handle orders subscription separately

  useEffect(() => {
    if (!user) return;

    // Subscribe to mining data
    const miningRef = doc(db, 'mining', user.uid);
    const unsubscribeMining = onSnapshot(
      miningRef,
      {
        next: (snapshot) => {
          if (snapshot.exists()) {
            updateMining(snapshot.data());
          }
        },
        error: (error) => {
          console.error('Mining subscription error:', error);
          toast.error('Failed to sync mining data');
        }
      }
    );

    return () => {
      unsubscribeMining();
    };
  }, [user, updateMining]);
}