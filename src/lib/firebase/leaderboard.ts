import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export async function updateLeaderboardStats(
  userId: string,
  isWin: boolean,
  points: number
) {
  const seasonRef = doc(db, 'leaderboard/season/users', userId);
  const allTimeRef = doc(db, 'leaderboard/all-time/users', userId);

  const updateData = {
    totalTrades: increment(1),
    wins: isWin ? increment(1) : increment(0),
    points: increment(points),
    updatedAt: serverTimestamp()
  };

  await Promise.all([
    updateDoc(seasonRef, updateData),
    updateDoc(allTimeRef, updateData)
  ]);
}

export async function getSeasonRewards(userId: string) {
  const seasonRef = doc(db, 'leaderboard/season/users', userId);
  const snapshot = await getDoc(seasonRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const rank = data.rank;

  // Calculate rewards based on rank
  let reward = 0;
  if (rank === 1) reward = 1000;
  else if (rank === 2) reward = 800;
  else if (rank === 3) reward = 600;
  else if (rank <= 10) reward = 400;
  else if (rank <= 20) reward = 300;
  else if (rank <= 50) reward = 200;
  else if (rank <= 100) reward = 100;

  return {
    rank,
    reward,
    winRate: data.winRate
  };
}

export async function startNewSeason() {
  const batch = writeBatch(db);
  const usersRef = collection(db, 'leaderboard/season/users');
  const snapshot = await getDocs(usersRef);

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      totalTrades: 0,
      wins: 0,
      points: 0,
      rank: 0,
      winRate: 0,
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
}