import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { withAppCheck } from './withAppCheck';

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';

export const standings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(
    withAppCheck(async (req, res) => {
      try {
        const snap = await db
          .collection(`tournaments/${TOURNAMENT_ID}/group_standings`)
          .get();
        const standings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        res.json(standings);
      } catch (error) {
        functions.logger.error('standings function error:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
      }
    }, 'public, s-maxage=60, stale-while-revalidate=300'),
  );