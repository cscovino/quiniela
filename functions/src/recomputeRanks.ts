import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

const db = admin.firestore();

interface RecomputeInput {
  tournamentId: string;
}

interface StatsDoc {
  predictorId: string;
  tournamentId: string;
  totalPoints: number;
  rank?: number;
  percentile?: number;
  lastRankUpdate?: admin.firestore.Timestamp;
}

const Timestamp = admin.firestore.Timestamp;

async function doRecomputeRanks(tournamentId: string): Promise<void> {
  const now = Timestamp.now();
  const debounceWindow = new Timestamp(Math.floor((now.toMillis() - 60_000) / 1000), 0);
  const recentSnap = await db
    .collectionGroup('stats')
    .where('tournamentId', '==', tournamentId)
    .where('lastRankUpdate', '>', debounceWindow)
    .limit(1)
    .get();

  if (!recentSnap.empty) {
    functions.logger.log(`[recomputeRanks] Skipped — debounce (last update <60s)`);
    return;
  }

  const statsSnap = await db
    .collectionGroup('stats')
    .where('tournamentId', '==', tournamentId)
    .get();

  const allStats: Array<{
    ref: admin.firestore.DocumentReference;
    totalPoints: number;
  }> = [];

  statsSnap.forEach((doc) => {
    const data = doc.data() as StatsDoc;
    allStats.push({
      ref: doc.ref,
      totalPoints: data.totalPoints || 0,
    });
  });

  allStats.sort((a, b) => b.totalPoints - a.totalPoints);

  const totalPredictors = allStats.length;
  const tsNow = Timestamp.now();

  const batch = db.batch();
  allStats.forEach((stat, i) => {
    const rank = i + 1;
    const percentile = totalPredictors > 0 ? rank / totalPredictors : 1;
    batch.update(stat.ref, {
      rank,
      percentile,
      lastRankUpdate: tsNow,
    });
  });

  await batch.commit();

  functions.logger.log(`[recomputeRanks] Complete: ${totalPredictors} predictors ranked`);
}

export const recomputeRanks = functions.https.onCall(async (data: RecomputeInput) => {
  const tournamentId = data.tournamentId;

  if (!tournamentId) {
    throw new functions.https.HttpsError('invalid-argument', 'tournamentId is required');
  }

  await doRecomputeRanks(tournamentId);

  return { success: true };
});

export { doRecomputeRanks };
