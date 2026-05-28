import { collectionGroup, getDocs, query, where } from 'firebase/firestore';

import { TOURNAMENT_ID } from '../config/tournament';
import type { PredictorStats } from '../types/firestore';
import { getDb } from './firebase';

export const rankingsService = {
  getAllPredictorStats: async (
    tournamentId: string = TOURNAMENT_ID,
  ): Promise<(PredictorStats & { userId: string; predictorId: string })[]> => {
    const statsRef = collectionGroup(getDb(), 'stats');
    const q = query(statsRef, where('__name__', '==', tournamentId));

    const snapshot = await getDocs(q);

    const allStats: (PredictorStats & { userId: string; predictorId: string })[] = [];

    for (const doc of snapshot.docs) {
      const refPath = doc.ref.path;
      const pathParts = refPath.split('/');

      const userId = pathParts[1];
      const predictorId = pathParts[3];

      allStats.push({
        ...(doc.data() as PredictorStats),
        userId,
        predictorId,
      });
    }

    return allStats.sort((a, b) => b.totalPoints - a.totalPoints);
  },

  getTopPredictors: async (
    tournamentId: string = TOURNAMENT_ID,
    limitCount: number = 20,
  ): Promise<(PredictorStats & { userId: string; predictorId: string })[]> => {
    const stats = await rankingsService.getAllPredictorStats(tournamentId);
    return stats.slice(0, limitCount);
  },
};
