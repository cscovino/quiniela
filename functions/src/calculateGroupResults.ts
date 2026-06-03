import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { doRecomputeRanks } from './recomputeRanks';
import { SCORING } from './scoring';

const db = admin.firestore();

// -- Types --

interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface GroupStandingsData {
  groupId: string;
  lastUpdated: admin.firestore.Timestamp;
  standings: TeamStanding[];
  pointsCalculated?: boolean;
}

interface GroupBetData {
  userId: string;
  predictorId: string;
  groupId: string;
  positions: string[];
  points: number;
  scoredAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// -- Pure scoring logic (directly testable) --

export function scoreGroupBet(
  positions: string[],
  standings: TeamStanding[],
): { points: number; exactMatches: number; wrongPositionMatches: number; exactQualified: number } {
  let points = 0;
  let exactMatches = 0;
  let wrongPositionMatches = 0;
  let exactQualified = 0;

  const qualifiedTeamIds = new Set(standings.slice(0, 4).map((s) => s.teamId));

  for (let i = 0; i < positions.length; i++) {
    const predictedTeam = positions[i];
    const actualTeamAtPosition = standings[i]?.teamId;

    if (predictedTeam === actualTeamAtPosition) {
      points += SCORING.GROUP.EXACT_POSITION; // 3
      exactMatches++;
    } else if (standings.some((s) => s.teamId === predictedTeam)) {
      points += SCORING.GROUP.QUALIFIED; // 1
      wrongPositionMatches++;
    }
    if (i < 4 && qualifiedTeamIds.has(predictedTeam)) {
      exactQualified++;
    }
  }

  return { points, exactMatches, wrongPositionMatches, exactQualified };
}

// -- Trigger handler --

export const calculateGroupResults = functions.firestore
  .document('tournaments/{tournamentId}/group_standings/{groupId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data() as GroupStandingsData;
    const tournamentId = context.params.tournamentId;
    const groupId = context.params.groupId;

    // Guard 1: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(`Group ${groupId} already scored — skipping`);
      return null;
    }

    const standings = after.standings;

    // Guard 2: check standings exist
    if (!standings || standings.length === 0) {
      functions.logger.error(`Group ${groupId} has no standings`);
      return null;
    }

    functions.logger.log(
      `Scoring group bets for ${tournamentId}/${groupId} — ${standings.length} teams`,
    );

    // Query all group_bets for this group
    const betsSnapshot = await db
      .collection(`tournaments/${tournamentId}/group_bets`)
      .where('groupId', '==', groupId)
      .get();

    if (betsSnapshot.empty) {
      functions.logger.log(`No group bets found for ${groupId}`);
      // Still mark as scored to prevent re-triggering
      await change.after.ref.update({ pointsCalculated: true });
      return null;
    }

    // Collect scoring results per predictor for stats updates
    const predictorScores: Map<string, { userId: string; points: number; exactQualified: number }> =
      new Map();

    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as GroupBetData;
      const { points, exactQualified } = scoreGroupBet(bet.positions, standings);

      batch.update(betDoc.ref, {
        points,
        scoredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      predictorScores.set(bet.predictorId, {
        userId: bet.userId,
        points,
        exactQualified,
      });

      functions.logger.log(
        `Group bet ${betDoc.id}: scored ${points} pts (${exactQualified} qualified) ` +
          `(predicted ${bet.positions.join(',')})`,
      );
    }

    // Mark group standings as scored
    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(`Scored ${betsSnapshot.size} group bets for ${groupId}`);

    // Update predictor stats for each affected predictor (D-10)
    for (const [predictorId, score] of predictorScores) {
      const statsRef = db
        .collection(`users/${score.userId}/predictors/${predictorId}/stats`)
        .doc(tournamentId);

      await statsRef.set(
        {
          totalPoints: FieldValue.increment(score.points),
          groupQualified: FieldValue.increment(score.exactQualified),
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    functions.logger.log(`Updated stats for ${predictorScores.size} predictors`);

    try {
      await doRecomputeRanks(tournamentId);
    } catch (err) {
      functions.logger.error('Rank recompute failed after group scoring', err);
    }

    return null;
  });
