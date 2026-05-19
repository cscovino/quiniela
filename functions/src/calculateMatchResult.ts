import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

function calculatePoints(
  betHome: number,
  betAway: number,
  actualHome: number,
  actualAway: number,
): { points: number; isExact: boolean; isWinner: boolean } {
  const isExact = betHome === actualHome && betAway === actualAway;

  const betOutcome = betHome > betAway ? 'home' : betHome < betAway ? 'away' : 'draw';
  const actualOutcome = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw';
  const isWinner = betOutcome === actualOutcome;

  return {
    points: isExact ? 3 : isWinner ? 1 : 0,
    isExact,
    isWinner,
  };
}

export const calculateMatchResult = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as MatchData;
    const after = change.after.data() as MatchData;

    const wasAlreadyFinished = before.status === 'finished';
    const isNowFinished = after.status === 'finished';

    if (!isNowFinished || wasAlreadyFinished) {
      return null;
    }

    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(`Match ${context.params.matchId} finished but result is null`);
      return null;
    }

    if (after.pointsCalculated) {
      functions.logger.log(`Match ${context.params.matchId} already processed`);
      return null;
    }

    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;
    const actualHome = after.result.home;
    const actualAway = after.result.away;

    functions.logger.log(
      `Calculating points for match ${matchId}: ${actualHome}-${actualAway}`,
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
        `Bet ${betDoc.id}: predicted ${bet.homeScore}-${bet.awayScore}, got ${points} points`,
      );
    }

    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();

    functions.logger.log(`Processed ${betsSnapshot.size} bets for match ${matchId}`);

    return null;
  });
