import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const live = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (_req, res) => {
    res.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    res.set('Access-Control-Allow-Origin', '*');

    try {
      const now = admin.firestore.Timestamp.now();
      const oneHourAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 3600000);

      const [liveSnap, recentSnap] = await Promise.all([
        db.collection('matches').where('status', '==', 'live').get(),
        db
          .collection('matches')
          .where('status', '==', 'finished')
          .where('finishedAt', '>=', oneHourAgo)
          .get(),
      ]);

      const matches = [...liveSnap.docs, ...recentSnap.docs].map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      res.json(matches);
    } catch (error) {
      functions.logger.error('live function error:', error);
      res.status(500).json({ error: 'Failed to fetch live matches' });
    }
  });
