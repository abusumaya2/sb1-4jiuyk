import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

type SnapshotCallback = (data: DocumentData[]) => void;
type ErrorCallback = (error: Error) => void;

export class RealtimeService {
  private subscriptions: Map<string, () => void> = new Map();

  subscribeToOrders(
    userId: string, 
    onData: SnapshotCallback, 
    onError?: ErrorCallback
  ): () => void {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onData(orders);
      },
      error => {
        console.error('Error in orders subscription:', error);
        if (onError) onError(error);
      }
    );

    this.subscriptions.set('orders', unsubscribe);
    return unsubscribe;
  }

  subscribeToMining(
    userId: string,
    onData: SnapshotCallback,
    onError?: ErrorCallback
  ): () => void {
    const miningQuery = query(
      collection(db, 'mining'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      miningQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const miningData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onData(miningData);
      },
      error => {
        console.error('Error in mining subscription:', error);
        if (onError) onError(error);
      }
    );

    this.subscriptions.set('mining', unsubscribe);
    return unsubscribe;
  }

  subscribeToLeaderboard(
    onData: SnapshotCallback,
    onError?: ErrorCallback
  ): () => void {
    const leaderboardQuery = query(
      collection(db, 'leaderboard'),
      orderBy('points', 'desc'),
      orderBy('winRate', 'desc')
    );

    const unsubscribe = onSnapshot(
      leaderboardQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const leaderboardData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onData(leaderboardData);
      },
      error => {
        console.error('Error in leaderboard subscription:', error);
        if (onError) onError(error);
      }
    );

    this.subscriptions.set('leaderboard', unsubscribe);
    return unsubscribe;
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

export const realtimeService = new RealtimeService();