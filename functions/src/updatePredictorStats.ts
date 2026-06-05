import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

const db = admin.firestore();

interface BetData {
  userId: string;
  predictorId: string;
  matchId: string;
  points: number;
  isExact: boolean;
  isWinner: boolean;
}

interface MatchStatusData {
  status: string;
}

export function computeStatsFromBets(
  bets: BetData[],
  matchStatuses: Map<string, string>,
): {
  totalPoints: number;
  exactBets: number;
  winnerBets: number;
  totalBets: number;
  finishedBets: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  pointsHistory: { points: number; matchId: string }[];
} {
  let totalPoints = 0;
  let exactBets = 0;
  let winnerBets = 0;
  let totalBets = 0;
  let finishedBets = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  const pointsHistory: { points: number; matchId: string }[] = [];

  for (const data of bets) {
    totalBets += 1;
    totalPoints += data.points;

    const matchStatus = matchStatuses.get(data.matchId);
    const isFinished = matchStatus === 'finished';

    if (isFinished) {
      finishedBets += 1;
      if (data.isExact) exactBets += 1;
      if (data.isWinner) winnerBets += 1;
    }

    if (data.points > 0) {
      tempStreak += 1;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    currentStreak = tempStreak;

    if (data.points > 0) {
      pointsHistory.push({
        points: data.points,
        matchId: data.matchId,
      });
    }
  }

  const accuracy = finishedBets > 0 ? winnerBets / finishedBets : 0;

  return {
    totalPoints,
    exactBets,
    winnerBets,
    totalBets,
    finishedBets,
    accuracy,
    currentStreak,
    maxStreak,
    pointsHistory,
  };
}

interface PredictorStatsData {
  predictorId: string;
  tournamentId: string;
  totalPoints: number;
  exactBets: number;
  winnerBets: number;
  totalBets: number;
  finishedBets: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  pointsHistory: { timestamp: admin.firestore.Timestamp; points: number; matchId: string }[];
  badgesAwarded: Record<string, string>;
  lastUpdated: admin.firestore.Timestamp;
}

export const updatePredictorStats = functions.firestore
  .document('tournaments/{tournamentId}/bets/{betId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as BetData;
    const after = change.after.data() as BetData;

    if (before.points === after.points) {
      return null;
    }

    const tournamentId = context.params.tournamentId;
    const { userId, predictorId } = after;

    functions.logger.log(
      `Updating stats for predictor ${predictorId} in tournament ${tournamentId}`,
    );

    const allBetsSnapshot = await db
      .collection(`tournaments/${tournamentId}/bets`)
      .where('predictorId', '==', predictorId)
      .get();

    const bets: BetData[] = allBetsSnapshot.docs.map((doc) => doc.data() as BetData);

    // Fetch match statuses to calculate accuracy against finished matches only
    const matchIds = [...new Set(bets.map((b) => b.matchId))];
    const matchStatuses = new Map<string, string>();
    if (matchIds.length > 0) {
      const matchesSnapshot = await db
        .collection(`tournaments/${tournamentId}/matches`)
        .where(admin.firestore.FieldPath.documentId(), 'in', matchIds)
        .get();
      matchesSnapshot.forEach((doc) => {
        const data = doc.data() as MatchStatusData;
        matchStatuses.set(doc.id, data.status);
      });
    }

    const computed = computeStatsFromBets(bets, matchStatuses);

    const statsRef = db
      .collection(`users/${userId}/predictors/${predictorId}/stats`)
      .doc(tournamentId);

    const statsDoc = await statsRef.get();

    const existingBadges = statsDoc.exists
      ? (statsDoc.data() as PredictorStatsData).badgesAwarded || {}
      : {};

    const pointsHistory = computed.pointsHistory.map((p) => ({
      ...p,
      timestamp: admin.firestore.Timestamp.now(),
    }));

    await statsRef.set(
      {
        predictorId,
        tournamentId,
        totalPoints: computed.totalPoints,
        exactBets: computed.exactBets,
        winnerBets: computed.winnerBets,
        totalBets: computed.totalBets,
        finishedBets: computed.finishedBets,
        accuracy: computed.accuracy,
        currentStreak: computed.currentStreak,
        maxStreak: computed.maxStreak,
        pointsHistory,
        badgesAwarded: existingBadges,
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    functions.logger.log(
      `Stats updated: ${computed.totalPoints}pts, ${computed.exactBets} exact, ${computed.winnerBets} winner, ${computed.accuracy.toFixed(2)} accuracy`,
    );

    return null;
  });
