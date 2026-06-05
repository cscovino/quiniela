import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { SCORING } from './scoring';

const db = admin.firestore();

interface MatchData {
  slug: string;
  phase: string;
  status: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  result: { home: number | null; away: number | null };
  pointsCalculated?: boolean;
}

interface KnockoutBetData {
  userId: string;
  predictorId: string;
  matchId: string;
  predictedWinner: string;
  points: number;
}

const KO_PHASES = new Set([
  'round-of-32',
  'round-of-16',
  'quarterfinals',
  'semifinals',
  'third-place',
  'final',
]);

export function scoreKnockoutBet(
  predictedWinner: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  result: { home: number | null; away: number | null },
): { points: number } {
  if (result.home === null || result.away === null) return { points: SCORING.KNOCKOUT.WRONG };
  if (!homeTeamId || !awayTeamId) return { points: SCORING.KNOCKOUT.WRONG };

  const homeWin = result.home > result.away;
  const actualWinner = (homeWin ? homeTeamId : awayTeamId).toUpperCase();
  const predicted = predictedWinner.toUpperCase();

  return {
    points: predicted === actualWinner ? SCORING.KNOCKOUT.CORRECT : SCORING.KNOCKOUT.WRONG,
  };
}

export const calculateKnockoutResults = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as MatchData;
    const after = change.after.data() as MatchData;

    if (!KO_PHASES.has(after.phase)) {
      return null;
    }

    const wasAlreadyFinished = before.status === 'finished';
    const isNowFinished = after.status === 'finished';

    if (!isNowFinished || wasAlreadyFinished) {
      return null;
    }

    if (!after.homeTeamId || !after.awayTeamId) {
      functions.logger.error(
        `Match ${after.slug} finished without resolved home/away — skipping KO scoring`,
      );
      return null;
    }

    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(`Match ${after.slug} finished but result is null`);
      return null;
    }

    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;

    functions.logger.log(`Scoring knockout bets for ${matchId}`);

    const betsSnapshot = await db
      .collection(`tournaments/${tournamentId}/knockout_bets`)
      .where('matchId', '==', matchId)
      .get();

    if (betsSnapshot.empty) {
      functions.logger.log(`No knockout bets found for ${matchId}`);
      return null;
    }

    const predictorScores = new Map<string, { userId: string; points: number }>();
    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as KnockoutBetData;
      const { points } = scoreKnockoutBet(
        bet.predictedWinner,
        after.homeTeamId,
        after.awayTeamId,
        after.result,
      );

      batch.update(betDoc.ref, {
        points,
        updatedAt: FieldValue.serverTimestamp(),
      });

      predictorScores.set(bet.predictorId, { userId: bet.userId, points });

      functions.logger.log(
        `Knockout bet ${betDoc.id}: predicted ${bet.predictedWinner}, got ${points} pts`,
      );
    }

    await batch.commit();
    functions.logger.log(`Scored ${betsSnapshot.size} knockout bets for ${matchId}`);

    for (const [predictorId, score] of predictorScores) {
      const statsRef = db
        .collection(`users/${score.userId}/predictors/${predictorId}/stats`)
        .doc(tournamentId);
      await statsRef.set(
        {
          totalPoints: FieldValue.increment(score.points),
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    return null;
  });
