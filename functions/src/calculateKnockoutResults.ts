/**
 * KNOCKOUT MATCHES DO NOT AWARD POINTS — Cloud Function is disabled.
 *
 * User predictions for knockout winners are preserved but never scored.
 * The `scoreKnockoutBet` utility is kept here in case scoring is re-enabled later.
 *
 * To re-enable: uncomment the Cloud Function export below and restore the imports.
 */

// Unused while disabled — kept for reference when re-enabling
// import * as admin from 'firebase-admin';
// import { FieldValue } from 'firebase-admin/firestore';
// import * as functions from 'firebase-functions/v1';
// import { recomputePredictorTotals } from './recomputePredictorTotals';
// import { SCORING } from './scoring';

// Unused interfaces — kept for reference
// interface MatchData { slug, phase, status, homeTeamId, awayTeamId, result, pointsCalculated }
// interface KnockoutBetData { userId, predictorId, matchId, predictedWinner, points }
// const KO_PHASES = new Set(['round-of-32', 'round-of-16', 'quarterfinals', 'semifinals', 'third-place', 'final']);

export function scoreKnockoutBet(
  predictedWinner: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  result: { home: number | null; away: number | null },
): { points: number } {
  // KO scoring constants (unused — kept for reference when re-enabling)
  // const CORRECT = 1, WRONG = 0
  if (result.home === null || result.away === null) return { points: 0 };
  if (!homeTeamId || !awayTeamId) return { points: 0 };

  const homeWin = result.home > result.away;
  const actualWinner = (homeWin ? homeTeamId : awayTeamId).toUpperCase();
  const predicted = predictedWinner.toUpperCase();

  return {
    points: predicted === actualWinner ? 1 : 0,
  };
}

/*
// Re-enable: uncomment and restore imports above
export const calculateKnockoutResults = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    // ... full implementation ...
  });
*/
