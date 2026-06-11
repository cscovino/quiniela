import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { recomputePredictorTotals } from './recomputePredictorTotals';
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
    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;

    functions.logger.log(
      `[calculateKnockoutResults] Triggered: tournament=${tournamentId}, match=${matchId}, phase=${after.phase}, status=${after.status}`,
    );

    if (!KO_PHASES.has(after.phase)) {
      functions.logger.log(
        `[calculateKnockoutResults] Match ${matchId} phase '${after.phase}' not a knockout phase — skipping`,
      );
      return null;
    }

    const wasAlreadyFinished = before.status === 'finished';
    const isNowFinished = after.status === 'finished';

    if (!isNowFinished) {
      functions.logger.log(
        `[calculateKnockoutResults] Match ${matchId} not finished yet — skipping`,
      );
      return null;
    }

    if (wasAlreadyFinished) {
      functions.logger.log(
        `[calculateKnockoutResults] Match ${matchId} was already finished — skipping`,
      );
      return null;
    }

    if (!after.homeTeamId || !after.awayTeamId) {
      functions.logger.error(
        `[calculateKnockoutResults] Match ${matchId} (${after.slug}) finished without resolved home/away — skipping`,
      );
      return null;
    }

    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(
        `[calculateKnockoutResults] Match ${matchId} (${after.slug}) finished but result is null`,
      );
      return null;
    }

    functions.logger.log(
      `[calculateKnockoutResults] Processing knockout match ${matchId}: ${after.slug}, home=${after.homeTeamId} vs away=${after.awayTeamId}, result=${after.result.home}-${after.result.away}`,
    );

    const betsSnapshot = await db
      .collection(`tournaments/${tournamentId}/knockout_bets`)
      .where('matchId', '==', matchId)
      .get();

    functions.logger.log(
      `[calculateKnockoutResults] Found ${betsSnapshot.size} knockout bets for match ${matchId}`,
    );

    if (betsSnapshot.empty) {
      functions.logger.log(`[calculateKnockoutResults] No knockout bets found for ${matchId}`);
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
        `[calculateKnockoutResults] Knockout bet ${betDoc.id} (predictor=${bet.predictorId}): predicted ${bet.predictedWinner} → ${points} pts`,
      );
    }

    await batch.commit();
    functions.logger.log(
      `[calculateKnockoutResults] Committed batch: ${betsSnapshot.size} knockout bets scored`,
    );

    for (const [predictorId, score] of predictorScores) {
      const derived = await recomputePredictorTotals(score.userId, predictorId, tournamentId);
      functions.logger.log(
        `[calculateKnockoutResults] Recomputed stats for predictor ${predictorId}: totalPoints=${derived.totalPoints} (knockout=${derived.knockoutPoints})`,
      );
    }

    functions.logger.log(
      `[calculateKnockoutResults] Completed: ${predictorScores.size} predictors updated`,
    );

    return null;
  });
