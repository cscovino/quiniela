import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { recomputePredictorTotals } from './recomputePredictorTotals';
import { doRecomputeRanks } from './recomputeRanks';
import { SCORING } from './scoring';

const db = admin.firestore();

// -- Types --

interface BestPlayersResultDoc {
  topScorer: string;
  bestGoalkeeper: string;
  tournamentId: string;
  pointsCalculated?: boolean;
}

interface BestPlayersBetDoc {
  userId: string;
  predictorId: string;
  bestGoalkeeper: string;
  bestScorer: string;
  points: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// -- Fuzzy matching helpers --

/**
 * Normalize a name for fuzzy comparison:
 * lowercase → trim → strip diacritics → strip non-alphanumeric.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .replace(/[^a-z0-9\s]/g, ''); // strip non-alphanumeric except spaces
}

/**
 * Fuzzy-match a predicted player name against the actual name.
 * Returns true if:
 * 1. The normalized predicted string contains the normalized actual string (or vice versa), or
 * 2. The last word (surname) of each matches and that surname is > 2 chars.
 */
function fuzzyMatch(predicted: string, actual: string): boolean {
  const normalizedPredicted = normalizeName(predicted);
  const normalizedActual = normalizeName(actual);

  if (!normalizedPredicted || !normalizedActual) return false;

  // Primary: contains match in either direction
  if (
    normalizedPredicted.includes(normalizedActual) ||
    normalizedActual.includes(normalizedPredicted)
  ) {
    return true;
  }

  // Surname fallback: compare the last word of each
  const predictedWords = normalizedPredicted.split(/\s+/).filter(Boolean);
  const actualWords = normalizedActual.split(/\s+/).filter(Boolean);
  const predictedSurname = predictedWords[predictedWords.length - 1];
  const actualSurname = actualWords[actualWords.length - 1];

  if (
    predictedSurname &&
    actualSurname &&
    predictedSurname.length > 2 &&
    predictedSurname === actualSurname
  ) {
    return true;
  }

  return false;
}

// -- Cloud Function trigger handler --

export const calculateBestPlayerResults = functions.firestore
  .document('tournaments/{tournamentId}/best_players_results/actual')
  .onWrite(async (change, context) => {
    const after = change.after.data() as BestPlayersResultDoc | undefined;
    const tournamentId = context.params.tournamentId;

    functions.logger.log(`[calculateBestPlayerResults] Triggered: tournament=${tournamentId}`);

    // Guard: skip on delete
    if (!after) {
      functions.logger.log(
        `[calculateBestPlayerResults] best_players_results/actual deleted — skipping`,
      );
      return null;
    }

    // Guard: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(
        `[calculateBestPlayerResults] best_players_results/actual already scored — skipping`,
      );
      return null;
    }

    const { topScorer, bestGoalkeeper } = after;

    functions.logger.log(
      `[calculateBestPlayerResults] Scoring best player bets for ${tournamentId} — topScorer: "${topScorer}", bestGoalkeeper: "${bestGoalkeeper}"`,
    );

    // Query all best_players_bets for this tournament
    const betsSnapshot = await db.collection(`tournaments/${tournamentId}/best_players_bets`).get();

    functions.logger.log(
      `[calculateBestPlayerResults] Found ${betsSnapshot.size} best player bets`,
    );

    if (betsSnapshot.empty) {
      functions.logger.log(
        `[calculateBestPlayerResults] No best player bets found for ${tournamentId} — marking as scored`,
      );
      await change.after.ref.update({ pointsCalculated: true });
      return null;
    }

    // Collect scoring results per predictor for stats updates
    const predictorScores: Map<string, { userId: string; points: number }> = new Map();

    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as BestPlayersBetDoc;

      const scoreTopScorer = topScorer ? fuzzyMatch(bet.bestScorer, topScorer) : false;
      const scoreGoalkeeper = bestGoalkeeper
        ? fuzzyMatch(bet.bestGoalkeeper, bestGoalkeeper)
        : false;

      const points =
        (scoreTopScorer ? SCORING.BEST_PLAYER.CORRECT : 0) +
        (scoreGoalkeeper ? SCORING.BEST_PLAYER.CORRECT : 0);

      batch.update(betDoc.ref, {
        points,
        scoredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      predictorScores.set(bet.predictorId, {
        userId: bet.userId,
        points,
      });

      functions.logger.log(
        `[calculateBestPlayerResults] Best player bet ${betDoc.id} (predictor=${bet.predictorId}): scored ${points} pts ` +
          `(topScorer: ${scoreTopScorer}, goalkeeper: ${scoreGoalkeeper})`,
      );
    }

    // Mark results doc as scored
    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(
      `[calculateBestPlayerResults] Committed batch: ${betsSnapshot.size} best player bets scored`,
    );

    // Update predictor stats for each affected predictor
    for (const [predictorId, score] of predictorScores) {
      const derived = await recomputePredictorTotals(score.userId, predictorId, tournamentId);
      functions.logger.log(
        `[calculateBestPlayerResults] Recomputed stats for predictor ${predictorId}: totalPoints=${derived.totalPoints} (bestPlayer=${derived.bestPlayerPoints})`,
      );
    }

    functions.logger.log(
      `[calculateBestPlayerResults] Updated stats for ${predictorScores.size} predictors`,
    );

    try {
      await doRecomputeRanks(tournamentId);
      functions.logger.log(`[calculateBestPlayerResults] Rank recompute completed`);
    } catch (err) {
      functions.logger.error(
        '[calculateBestPlayerResults] Rank recompute failed after best player scoring',
        err,
      );
    }

    return null;
  });

// -- Export pure functions for testing --

export { fuzzyMatch, normalizeName };
