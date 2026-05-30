import type { PredictorStats } from '../types/firestore';
import { fetchRankingsFromApi } from './rankings-api';

export const rankingsService = {
  // Routed through the cached `/api/rankings` function (Admin SDK) rather than a
  // client `collectionGroup('stats')` query — see rankings-api.ts. Already sorted
  // by totalPoints descending.
  getAllPredictorStats: async (): Promise<
    (PredictorStats & { userId: string; predictorId: string })[]
  > => {
    const apiStats = await fetchRankingsFromApi();
    return apiStats.map(
      (s) =>
        ({
          userId: s.userId,
          predictorId: s.predictorId,
          totalPoints: s.totalPoints,
          accuracy: s.accuracy,
          currentStreak: s.currentStreak,
          exactBets: s.exactBets,
          badgesAwarded: s.badgesAwarded,
          pointsHistory: s.pointsHistory,
        }) as unknown as PredictorStats & { userId: string; predictorId: string },
    );
  },

  getTopPredictors: async (
    limitCount: number = 20,
  ): Promise<(PredictorStats & { userId: string; predictorId: string })[]> => {
    const stats = await rankingsService.getAllPredictorStats();
    return stats.slice(0, limitCount);
  },
};
