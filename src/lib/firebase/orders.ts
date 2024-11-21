import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  increment,
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { processReferralBonus } from './referrals';

export async function claimOrderInFirebase(orderId: string, userId: string, currentPrice: number) {
  const orderRef = doc(db, 'orders', orderId);
  const userRef = doc(db, 'users', userId);

  try {
    return await runTransaction(db, async (transaction) => {
      // STEP 1: Perform all reads first
      const orderDoc = await transaction.get(orderRef);
      const userDoc = await transaction.get(userRef);

      // Validate documents exist
      if (!orderDoc.exists() || !userDoc.exists()) {
        throw new Error('Order or user not found');
      }

      const orderData = orderDoc.data();
      const userData = userDoc.data();

      // Validate order
      if (orderData.userId !== userId) {
        throw new Error('Order not found');
      }
      if (orderData.status !== 'ready_to_claim') {
        throw new Error('Order not ready to claim');
      }

      // Use the fixed exit price
      const exitPrice = orderData.fixedExitPrice;
      if (!exitPrice) {
        throw new Error('Exit price not fixed');
      }

      // Calculate results
      const priceDiff = exitPrice - orderData.entryPrice;
      const isWin = (orderData.type === 'buy' && priceDiff > 0) || 
                   (orderData.type === 'sell' && priceDiff < 0);
      
      // Calculate points change - win gets exact amount back plus equal amount as profit
      const pointsChange = isWin ? orderData.amount * 2 : 0;
      const profit = isWin ? orderData.amount : -orderData.amount;

      // Calculate new stats
      const newWins = userData.wins + (isWin ? 1 : 0);
      const newLosses = userData.losses + (isWin ? 0 : 1);
      const totalTrades = newWins + newLosses;
      const winRate = totalTrades > 0 ? (newWins / totalTrades) * 100 : 0;

      // Update user points and stats
      transaction.update(userRef, {
        points: increment(pointsChange - orderData.amount), // Deduct bet amount and add winnings if any
        wins: increment(isWin ? 1 : 0),
        losses: increment(isWin ? 0 : 1),
        totalTrades: increment(1),
        winRate,
        updatedAt: serverTimestamp()
      });

      transaction.update(orderRef, {
        status: 'completed',
        result: isWin ? 'win' : 'loss',
        profit,
        exitPrice,
        completedAt: serverTimestamp()
      });

      // Create history record
      const historyRef = doc(collection(db, `users/${userId}/orderHistory`));
      transaction.set(historyRef, {
        orderId,
        symbol: orderData.symbol,
        type: orderData.type,
        amount: orderData.amount,
        entryPrice: orderData.entryPrice,
        exitPrice,
        result: isWin ? 'win' : 'loss',
        profit,
        createdAt: orderData.createdAt,
        completedAt: serverTimestamp()
      });

      // Process referral bonus for trading profit
      if (isWin) {
        try {
          await processReferralBonus(userId, profit, 'trading');
        } catch (error) {
          console.error('Error processing referral bonus:', error);
        }
      }

      return {
        success: true,
        isWin,
        profit,
        amount: orderData.amount,
        symbol: orderData.symbol,
        type: orderData.type
      };
    });
  } catch (error) {
    console.error('Error claiming order:', error);
    throw error;
  }
}

// Function to fix exit price when timeframe ends
export async function fixExitPrice(orderId: string, exitPrice: number) {
  const orderRef = doc(db, 'orders', orderId);
  
  try {
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      return false;
    }

    const orderData = orderDoc.data();
    // Only fix price if order is still active
    if (orderData.status === 'active') {
      await updateDoc(orderRef, {
        status: 'ready_to_claim',
        fixedExitPrice: exitPrice,
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error('Error fixing exit price:', error);
    return false;
  }
}