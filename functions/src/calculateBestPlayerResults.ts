import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

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

    // Guard: skip on delete
    if (!after) {
      functions.logger.log(`best_players_results/actual deleted — skipping`);
      return null;
    }

    // Guard: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(`best_players_results/actual already scored — skipping`);
      return null;
    }

    const { topScorer, bestGoalkeeper } = after;

    functions.logger.log(
      `Scoring best player bets for ${tournamentId} — topScorer: "${topScorer}", bestGoalkeeper: "${bestGoalkeeper}"`,
    );

    // Query all best_players_bets for this tournament
    const betsSnapshot = await db.collection(`tournaments/${tournamentId}/best_players_bets`).get();

    if (betsSnapshot.empty) {
      functions.logger.log(`No best player bets found for ${tournamentId}`);
      // Mark as scored to prevent re-triggering
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
        `Best player bet ${betDoc.id}: scored ${points} pts ` +
          `(topScorer: ${scoreTopScorer}, goalkeeper: ${scoreGoalkeeper})`,
      );
    }

    // Mark results doc as scored
    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(`Scored ${betsSnapshot.size} best player bets for ${tournamentId}`);

    // Update predictor stats for each affected predictor
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

    functions.logger.log(`Updated stats for ${predictorScores.size} predictors`);

    return null;
  });

// -- Export pure functions for testing --

export { fuzzyMatch, normalizeName };
