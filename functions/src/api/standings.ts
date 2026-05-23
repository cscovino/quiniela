import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const standings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (_req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.set('Access-Control-Allow-Origin', '*');

    try {
      const snap = await db.collection('groupStandings').get();
      const standings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json(standings);
    } catch (error) {
      functions.logger.error('standings function error:', error);
      res.status(500).json({ error: 'Failed to fetch standings' });
    }
  });
