import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { SCORING } from './scoring';

const db = admin.firestore();

interface MatchData {
  slug: string;
  phase: string;
  groupId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date: admin.firestore.Timestamp;
  stadium: string;
  result: { home: number | null; away: number | null };
  status: string;
  predictionDeadline: admin.firestore.Timestamp;
  pointsCalculated?: boolean;
  createdAt: admin.firestore.Timestamp;
}

interface BetData {
  userId: string;
  predictorId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points: number;
  isExact: boolean;
  isWinner: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

export function calculatePoints(
  betHome: number,
  betAway: number,
  actualHome: number,
  actualAway: number,
): { points: number; isExact: boolean; isWinner: boolean } {
  const isExact = betHome === actualHome && betAway === actualAway;

  const betOutcome = betHome > betAway ? 'home' : betHome < betAway ? 'away' : 'draw';
  const actualOutcome =
    actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw';
  const isWinner = betOutcome === actualOutcome;

  return {
    points: isExact ? SCORING.MATCH.EXACT : isWinner ? SCORING.MATCH.WINNER : SCORING.MATCH.WRONG,
    isExact,
    isWinner,
  };
}

export const calculateMatchResult = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as MatchData;
    const after = change.after.data() as MatchData;
    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;

    functions.logger.log(
      `[calculateMatchResult] Triggered: tournament=${tournamentId}, match=${matchId}, beforeStatus=${before.status}, afterStatus=${after.status}`,
    );

    const wasAlreadyFinished = before.status === 'finished';
    const isNowFinished = after.status === 'finished';

    if (!isNowFinished) {
      functions.logger.log(
        `[calculateMatchResult] Match ${matchId} not finished yet (status=${after.status}) — skipping`,
      );
      return null;
    }

    if (wasAlreadyFinished) {
      functions.logger.log(
        `[calculateMatchResult] Match ${matchId} was already finished — skipping`,
      );
      return null;
    }

    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(`[calculateMatchResult] Match ${matchId} finished but result is null`);
      return null;
    }

    if (after.pointsCalculated) {
      functions.logger.log(
        `[calculateMatchResult] Match ${matchId} already processed (pointsCalculated=true)`,
      );
      return null;
    }

    const actualHome = after.result.home;
    const actualAway = after.result.away;

    functions.logger.log(
      `[calculateMatchResult] Processing match ${matchId}: ${actualHome}-${actualAway}`,
    );

    const betsSnapshot = await db
      .collection(`tournaments/${tournamentId}/bets`)
      .where('matchId', '==', matchId)
      .get();

    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as BetData;

      const { points, isExact, isWinner } = calculatePoints(
        bet.homeScore,
        bet.awayScore,
        actualHome,
        actualAway,
      );

      batch.update(betDoc.ref, {
        points,
        isExact,
        isWinner,
        updatedAt: FieldValue.serverTimestamp(),
      });

      functions.logger.log(
        `[calculateMatchResult] Bet ${betDoc.id} (predictor=${bet.predictorId}): predicted ${bet.homeScore}-${bet.awayScore} → ${points} pts (exact=${isExact}, winner=${isWinner})`,
      );
    }

    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();

    functions.logger.log(
      `[calculateMatchResult] Committing batch: ${betsSnapshot.size} bets updated for match ${matchId}`,
    );

    // Stats are NOT updated here. Each bet's points change fires
    // updatePredictorStats, which derives totalPoints from all bet collections
    // (idempotent). Incrementing here would double-count on function retries.

    return null;
  });
