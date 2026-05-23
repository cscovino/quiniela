import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const rankings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (_req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.set('Access-Control-Allow-Origin', '*');

    try {
      const snap = await db
        .collection('predictorStats')
        .orderBy('totalPoints', 'desc')
        .limit(100)
        .get();

      const rankings = snap.docs.map((d, i) => ({
        id: d.id,
        rank: i + 1,
        ...d.data(),
      }));
      res.json(rankings);
    } catch (error) {
      functions.logger.error('rankings function error:', error);
      res.status(500).json({ error: 'Failed to fetch rankings' });
    }
  });
