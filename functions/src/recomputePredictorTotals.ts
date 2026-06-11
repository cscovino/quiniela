import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

export interface CategorySubtotals {
  matchPoints: number;
  groupPoints: number;
  knockoutPoints: number;
  finalFourPoints: number;
  bestPlayerPoints: number;
}

export interface DerivedTotals extends CategorySubtotals {
  totalPoints: number;
  groupQualified: number;
}

/**
 * Sum the `points` field across a set of bet documents. Missing or non-numeric
 * points contribute 0 — bets default to 0 until their match/event is scored.
 */
export function sumPoints(bets: Array<{ points?: number | null }>): number {
  return bets.reduce((acc, b) => acc + (typeof b.points === 'number' ? b.points : 0), 0);
}

/**
 * Sum an arbitrary numeric field across bet documents (e.g. `exactQualified`).
 */
export function sumField(bets: Array<Record<string, unknown>>, field: string): number {
  return bets.reduce((acc, b) => {
    const v = b[field];
    return acc + (typeof v === 'number' ? v : 0);
  }, 0);
}

export function totalFromSubtotals(s: CategorySubtotals): number {
  return s.matchPoints + s.groupPoints + s.knockoutPoints + s.finalFourPoints + s.bestPlayerPoints;
}

async function fetchPredictorBets(
  tournamentId: string,
  collection: string,
  predictorId: string,
): Promise<Array<Record<string, unknown>>> {
  const snap = await db
    .collection(`tournaments/${tournamentId}/${collection}`)
    .where('predictorId', '==', predictorId)
    .get();
  return snap.docs.map((d) => d.data() as Record<string, unknown>);
}

/**
 * Recompute a predictor's points stats by DERIVING them from the bet
 * collections — the source of truth, since every scoring function writes each
 * bet's absolute `points` value.
 *
 * Writes per-category subtotals plus `totalPoints` as ABSOLUTE values (set +
 * merge), making this idempotent: re-running it any number of times (function
 * retries, re-seeds, manual repair) always converges to the same correct
 * total. This replaces the previous non-idempotent `FieldValue.increment`
 * approach that drifted on every re-trigger.
 *
 * `groupQualified` (a badge gate) is derived the same way from the
 * `exactQualified` field persisted on each scored group bet.
 */
export async function recomputePredictorTotals(
  userId: string,
  predictorId: string,
  tournamentId: string,
): Promise<DerivedTotals> {
  const [matchBets, groupBets, knockoutBets, finalPhaseBets, bestPlayersBets] = await Promise.all([
    fetchPredictorBets(tournamentId, 'bets', predictorId),
    fetchPredictorBets(tournamentId, 'group_bets', predictorId),
    fetchPredictorBets(tournamentId, 'knockout_bets', predictorId),
    fetchPredictorBets(tournamentId, 'final_phase_bets', predictorId),
    fetchPredictorBets(tournamentId, 'best_players_bets', predictorId),
  ]);

  const subtotals: CategorySubtotals = {
    matchPoints: sumPoints(matchBets),
    groupPoints: sumPoints(groupBets),
    knockoutPoints: sumPoints(knockoutBets),
    finalFourPoints: sumPoints(finalPhaseBets),
    bestPlayerPoints: sumPoints(bestPlayersBets),
  };
  const totalPoints = totalFromSubtotals(subtotals);
  const groupQualified = sumField(groupBets, 'exactQualified');

  const statsRef = db
    .collection(`users/${userId}/predictors/${predictorId}/stats`)
    .doc(tournamentId);

  await statsRef.set(
    {
      ...subtotals,
      totalPoints,
      groupQualified,
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { ...subtotals, totalPoints, groupQualified };
}
