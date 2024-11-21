import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { claimOrderInFirebase, fixExitPrice } from '../lib/firebase/orders';
import { cryptoService } from '../lib/cryptoService';
import { toast } from 'react-hot-toast';

export function useOrders() {
  const { user, setOrders } = useStore();

  // Listen to orders updates and handle timeframe endings
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;
    const priceSubscriptions: Record<string, () => void> = {};

    try {
      const ordersRef = collection(db, 'orders');
      const activeOrdersQuery = query(
        ordersRef,
        where('userId', '==', user.uid),
        where('status', 'in', ['active', 'ready_to_claim']),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(activeOrdersQuery, (snapshot) => {
        const now = Date.now();
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            symbol: data.symbol,
            type: data.type,
            timeframe: data.timeframe,
            amount: data.amount,
            entryPrice: data.entryPrice,
            timestamp: data.createdAt instanceof Timestamp ? 
              data.createdAt.toMillis() : 
              Date.now(),
            endTime: data.endTime,
            status: data.status,
            exitPrice: data.fixedExitPrice
          };
        });

        // Handle timeframe endings and fix exit prices
        orders.forEach(order => {
          if (now >= order.endTime && order.status === 'active') {
            // Subscribe to price for fixing exit price
            if (!priceSubscriptions[order.id]) {
              priceSubscriptions[order.id] = cryptoService.subscribe(
                order.symbol,
                async (priceData) => {
                  await fixExitPrice(order.id, priceData.price);
                  // Unsubscribe after fixing price
                  if (priceSubscriptions[order.id]) {
                    priceSubscriptions[order.id]();
                    delete priceSubscriptions[order.id];
                  }
                }
              );
            }
          }
        });

        setOrders(orders);
      }, (error) => {
        console.error('Orders subscription error:', error);
        toast.error('Failed to sync orders');
      });
    } catch (error) {
      console.error('Error setting up orders subscription:', error);
      toast.error('Failed to sync orders');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      // Clean up price subscriptions
      Object.values(priceSubscriptions).forEach(unsub => unsub());
    };
  }, [user, setOrders]);

  const claimOrder = useCallback(async (orderId: string, amount: number, currentPrice: number) => {
    if (!user) {
      toast.error('Please sign in to claim rewards');
      return;
    }

    const claimToast = toast.loading('Processing claim...');

    try {
      const result = await claimOrderInFirebase(orderId, user.uid, currentPrice);

      // Update local state after a short delay to ensure Firebase sync
      setTimeout(() => {
        if (result.isWin) {
          toast.dismiss(claimToast);
          toast.success(`+${result.profit.toFixed(2)} PTS`, { duration: 4000 });
        } else {
          toast.dismiss(claimToast);
          toast.error(`-${amount.toFixed(2)} PTS`, { duration: 4000 });
        }
      }, 500);

    } catch (error) {
      console.error('Error claiming order:', error);
      toast.dismiss(claimToast);
      toast.error('Failed to claim order');
    }
  }, [user]);

  return { claimOrder };
}