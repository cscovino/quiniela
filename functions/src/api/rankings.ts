import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { verifyAppCheckToken } from './appCheckMiddleware';

const db = admin.firestore();

export const rankings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.set('Access-Control-Allow-Origin', '*');

    await new Promise<void>((resolve, reject) => {
      verifyAppCheckToken(req, res, resolve);
    }).catch(() => {});

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

      const predictorRefs = new Set<string>();
      for (const s of sorted) {
        predictorRefs.add(`users/${s.userId}/predictors/${s.predictorId}`);
      }

      const predictorDocs = await Promise.all(
        Array.from(predictorRefs).map(async (ref) => {
          const snap = await db.doc(ref).get();
          return { id: ref, name: snap.exists ? snap.data()?.name || null : null };
        }),
      );

      const nameMap = new Map<string, string>();
      for (const p of predictorDocs) {
        nameMap.set(p.id, p.name || p.id.split('/').pop() || 'Unknown');
      }

      const rankings = sorted.map((s, i) => ({
        id: s.id,
        rank: i + 1,
        userId: s.userId,
        predictorId: s.predictorId,
        displayName: nameMap.get(`users/${s.userId}/predictors/${s.predictorId}`) || s.predictorId,
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
