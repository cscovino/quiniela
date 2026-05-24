import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const rankings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (_req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.set('Access-Control-Allow-Origin', '*');

    try {
      const statsSnap = await db.collectionGroup('stats').get();

      const allStats: Array<{
        id: string;
        userId: string;
        predictorId: string;
        totalPoints: number;
        accuracy: number;
        currentStreak: number;
        exactBets: number;
      }> = [];

      statsSnap.forEach((doc) => {
        const refPath = doc.ref.path;
        const pathParts = refPath.split('/');
        const userId = pathParts[1];
        const predictorId = pathParts[3];
        const data = doc.data();
        allStats.push({
          id: doc.id,
          userId,
          predictorId,
          totalPoints: data.totalPoints || 0,
          accuracy: data.accuracy || 0,
          currentStreak: data.currentStreak || 0,
          exactBets: data.exactBets || 0,
        });
      });

      const sorted = allStats
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 100);

      const rankings = sorted.map((s, i) => ({
        id: s.id,
        rank: i + 1,
        userId: s.userId,
        predictorId: s.predictorId,
        displayName: s.predictorId.split('-').slice(1).join('-') || s.userId.slice(0, 8),
        totalPoints: s.totalPoints,
        accuracy: s.accuracy,
        currentStreak: s.currentStreak,
        exactBets: s.exactBets,
      }));

      res.json(rankings);
    } catch (error) {
      functions.logger.error('rankings function error:', error);
      res.status(500).json({ error: 'Failed to fetch rankings' });
    }
  });
