import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { doRecomputeRanks } from './recomputeRanks';
import { SCORING } from './scoring';

const db = admin.firestore();

// -- Types --

export interface FinalFourBet {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export interface FinalStandings {
  first?: string;
  second?: string;
  third?: string;
  fourth?: string;
}

export interface ScoringResult {
  firstPoints: number;
  secondPoints: number;
  thirdPoints: number;
  fourthPoints: number;
  totalPoints: number;
}

interface FinalPhaseBetData {
  userId: string;
  predictorId: string;
  first: string;
  second: string;
  third: string;
  fourth: string;
  points: number;
  firstScoredAt?: admin.firestore.Timestamp;
  secondScoredAt?: admin.firestore.Timestamp;
  thirdScoredAt?: admin.firestore.Timestamp;
  fourthScoredAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface FinalStandingsDoc {
  tournamentId: string;
  first?: string;
  second?: string;
  third?: string;
  fourth?: string;
  pointsCalculated?: boolean;
}

// -- Pure scoring function (exported for testing) --

/**
 * Scores a final four bet against actual final standings.
 * - Exact position (1st/2nd/3rd/4th): 5 pts per position
 * - Team among final four but wrong position: 3 pts per position
 * - Team not in final four: 0 pts
 */
export function scoreFinalFourBet(bet: FinalFourBet, standings: FinalStandings): ScoringResult {
  const finalFour = [standings.first, standings.second, standings.third, standings.fourth].filter(
    Boolean,
  ) as string[];

  function scorePosition(predicted: string, actual: string | undefined): number {
    if (predicted?.toUpperCase() === actual?.toUpperCase()) {
      return SCORING.FINAL_FOUR.EXACT_POSITION; // 5
    }
    if (actual && finalFour.map((t) => t.toUpperCase()).includes(predicted.toUpperCase())) {
      return SCORING.FINAL_FOUR.QUALIFIED; // 3
    }
    return 0;
  }

  const firstPoints = scorePosition(bet.first, standings.first);
  const secondPoints = scorePosition(bet.second, standings.second);
  const thirdPoints = scorePosition(bet.third, standings.third);
  const fourthPoints = scorePosition(bet.fourth, standings.fourth);

  return {
    firstPoints,
    secondPoints,
    thirdPoints,
    fourthPoints,
    totalPoints: firstPoints + secondPoints + thirdPoints + fourthPoints,
  };
}

// -- Cloud Function trigger handler --

export const calculateFinalFourResults = functions.firestore
  .document('tournaments/{tournamentId}/final_standings/final')
  .onUpdate(async (change, context) => {
    const after = change.after.data() as FinalStandingsDoc;
    const tournamentId = context.params.tournamentId;

    // Guard (D-12): skip if already scored
    if (after.pointsCalculated === true) {
      functions.logger.log(`final_standings/final already scored — skipping`);
      return null;
    }

    // Build standings object
    const standings: FinalStandings = {
      first: after.first,
      second: after.second,
      third: after.third,
      fourth: after.fourth,
    };

    // Determine which positions are populated
    const populatedPositions = Object.keys(standings).filter(
      (key) => standings[key as keyof FinalStandings] !== undefined,
    );

    if (populatedPositions.length === 0) {
      functions.logger.log(`No final standings positions populated yet — skipping`);
      return null;
    }

    functions.logger.log(
      `Scoring final four bets for ${tournamentId} — standings: ${JSON.stringify(standings)}`,
    );

    // Query all final_phase_bets for this tournament
    const betsSnapshot = await db.collection(`tournaments/${tournamentId}/final_phase_bets`).get();

    if (betsSnapshot.empty) {
      functions.logger.log(`No final phase bets found for ${tournamentId}`);
      // Mark as scored to prevent re-triggering
      await change.after.ref.update({ pointsCalculated: true });
      return null;
    }

    // Collect predictor scores for stats updates
    const predictorScores: Map<string, { userId: string; points: number }> = new Map();

    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as FinalPhaseBetData;

      // Determine which positions need scoring (populated in standings and no scoredAt yet)
      const updateFields: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
      let newPoints = 0;

      if (standings.first && !bet.firstScoredAt) {
        const scorePosition = (predicted: string, actual: string | undefined): number => {
          const finalFour = [
            standings.first,
            standings.second,
            standings.third,
            standings.fourth,
          ].filter(Boolean) as string[];
          if (predicted?.toUpperCase() === actual?.toUpperCase()) {
            return SCORING.FINAL_FOUR.EXACT_POSITION;
          }
          if (actual && finalFour.map((t) => t.toUpperCase()).includes(predicted.toUpperCase())) {
            return SCORING.FINAL_FOUR.QUALIFIED;
          }
          return 0;
        };
        const firstPts = scorePosition(bet.first, standings.first);
        if (firstPts > 0) {
          updateFields.firstScoredAt = FieldValue.serverTimestamp();
          newPoints += firstPts;
        }
      }

      if (standings.second && !bet.secondScoredAt) {
        const scorePosition = (predicted: string, actual: string | undefined): number => {
          const finalFour = [
            standings.first,
            standings.second,
            standings.third,
            standings.fourth,
          ].filter(Boolean) as string[];
          if (predicted?.toUpperCase() === actual?.toUpperCase()) {
            return SCORING.FINAL_FOUR.EXACT_POSITION;
          }
          if (actual && finalFour.map((t) => t.toUpperCase()).includes(predicted.toUpperCase())) {
            return SCORING.FINAL_FOUR.QUALIFIED;
          }
          return 0;
        };
        const secondPts = scorePosition(bet.second, standings.second);
        if (secondPts > 0) {
          updateFields.secondScoredAt = FieldValue.serverTimestamp();
          newPoints += secondPts;
        }
      }

      if (standings.third && !bet.thirdScoredAt) {
        const scorePosition = (predicted: string, actual: string | undefined): number => {
          const finalFour = [
            standings.first,
            standings.second,
            standings.third,
            standings.fourth,
          ].filter(Boolean) as string[];
          if (predicted?.toUpperCase() === actual?.toUpperCase()) {
            return SCORING.FINAL_FOUR.EXACT_POSITION;
          }
          if (actual && finalFour.map((t) => t.toUpperCase()).includes(predicted.toUpperCase())) {
            return SCORING.FINAL_FOUR.QUALIFIED;
          }
          return 0;
        };
        const thirdPts = scorePosition(bet.third, standings.third);
        if (thirdPts > 0) {
          updateFields.thirdScoredAt = FieldValue.serverTimestamp();
          newPoints += thirdPts;
        }
      }

      if (standings.fourth && !bet.fourthScoredAt) {
        const scorePosition = (predicted: string, actual: string | undefined): number => {
          const finalFour = [
            standings.first,
            standings.second,
            standings.third,
            standings.fourth,
          ].filter(Boolean) as string[];
          if (predicted?.toUpperCase() === actual?.toUpperCase()) {
            return SCORING.FINAL_FOUR.EXACT_POSITION;
          }
          if (actual && finalFour.map((t) => t.toUpperCase()).includes(predicted.toUpperCase())) {
            return SCORING.FINAL_FOUR.QUALIFIED;
          }
          return 0;
        };
        const fourthPts = scorePosition(bet.fourth, standings.fourth);
        if (fourthPts > 0) {
          updateFields.fourthScoredAt = FieldValue.serverTimestamp();
          newPoints += fourthPts;
        }
      }

      if (newPoints > 0) {
        updateFields.points = (bet.points || 0) + newPoints;
        batch.update(betDoc.ref, updateFields);

        predictorScores.set(bet.predictorId, {
          userId: bet.userId,
          points: newPoints,
        });

        functions.logger.log(
          `Final phase bet ${betDoc.id}: scored ${newPoints} pts (total now ${updateFields.points})`,
        );
      }
    }

    // Mark final_standings as scored
    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(`Scored ${predictorScores.size} final phase bets`);

    // Update predictor stats for each affected predictor (D-10)
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

    try {
      await doRecomputeRanks(tournamentId);
    } catch (err) {
      functions.logger.error('Rank recompute failed after final four scoring', err);
    }

    return null;
  });
