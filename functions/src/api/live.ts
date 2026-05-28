import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { withAppCheck } from './withAppCheck';

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';

export const live = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(
    withAppCheck(async (req, res) => {
      try {
        const now = admin.firestore.Timestamp.now();
        const oneHourAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 3600000);

        const [liveSnap, recentSnap] = await Promise.all([
          db
            .collection(`tournaments/${TOURNAMENT_ID}/matches`)
            .where('status', '==', 'live')
            .get(),
          db
            .collection(`tournaments/${TOURNAMENT_ID}/matches`)
            .where('status', '==', 'finished')
            .where('date', '>=', oneHourAgo)
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
    }, 'public, s-maxage=30, stale-while-revalidate=120'),
  );