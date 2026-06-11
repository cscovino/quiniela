import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { recomputePredictorTotals } from './recomputePredictorTotals';
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

    if (predictedTeam?.toUpperCase() === actualTeamAtPosition?.toUpperCase()) {
      points += SCORING.GROUP.EXACT_POSITION; // 3
      exactMatches++;
    } else if (
      actualTeamAtPosition &&
      standings.some((s) => s.teamId?.toUpperCase() === predictedTeam?.toUpperCase())
    ) {
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

    functions.logger.log(
      `[calculateGroupResults] Triggered: tournament=${tournamentId}, group=${groupId}`,
    );

    // Guard 1: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(
        `[calculateGroupResults] Group ${groupId} already scored (pointsCalculated=true) — skipping`,
      );
      return null;
    }

    const standings = after.standings;

    // Guard 2: check standings exist
    if (!standings || standings.length === 0) {
      functions.logger.error(`[calculateGroupResults] Group ${groupId} has no standings`);
      return null;
    }

    // Guard 3: only score once the ENTIRE group stage is complete. Otherwise we
    // would lock in points against a partial table (e.g. after a single match,
    // standings list only the teams that have played). We return WITHOUT setting
    // pointsCalculated so the next standings update (when the final group match
    // finishes) re-evaluates and scores against the full table.
    const groupMatchesSnap = await db
      .collection(`tournaments/${tournamentId}/matches`)
      .where('groupId', '==', groupId)
      .get();
    const totalGroupMatches = groupMatchesSnap.size;
    const finishedGroupMatches = groupMatchesSnap.docs.filter(
      (d) => (d.data() as { status?: string }).status === 'finished',
    ).length;

    if (totalGroupMatches === 0 || finishedGroupMatches < totalGroupMatches) {
      functions.logger.log(
        `[calculateGroupResults] Group ${groupId} not complete (${finishedGroupMatches}/${totalGroupMatches} matches finished) — deferring scoring`,
      );
      return null;
    }

    functions.logger.log(
      `[calculateGroupResults] Scoring group bets for ${tournamentId}/${groupId} — ${standings.length} teams (top: ${standings
        .slice(0, 4)
        .map((t) => t.teamId)
        .join(',')})`,
    );

    // Query all group_bets for this group
    const betsSnapshot = await db
      .collection(`tournaments/${tournamentId}/group_bets`)
      .where('groupId', '==', groupId)
      .get();

    functions.logger.log(
      `[calculateGroupResults] Found ${betsSnapshot.size} group bets for group ${groupId}`,
    );

    if (betsSnapshot.empty) {
      functions.logger.log(
        `[calculateGroupResults] No group bets found for ${groupId} — marking as scored`,
      );
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
        // Persisted so groupQualified can be DERIVED (summed) idempotently,
        // rather than incremented per group-scoring event.
        exactQualified,
        scoredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      predictorScores.set(bet.predictorId, {
        userId: bet.userId,
        points,
        exactQualified,
      });

      functions.logger.log(
        `[calculateGroupResults] Group bet ${betDoc.id} (predictor=${bet.predictorId}): scored ${points} pts (${exactQualified} qualified) ` +
          `(predicted ${bet.positions.join(',')})`,
      );
    }

    // Mark group standings as scored
    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(
      `[calculateGroupResults] Committed batch: ${betsSnapshot.size} group bets scored`,
    );

    // Update predictor stats for each affected predictor
    for (const [predictorId, score] of predictorScores) {
      const derived = await recomputePredictorTotals(score.userId, predictorId, tournamentId);
      functions.logger.log(
        `[calculateGroupResults] Recomputed stats for predictor ${predictorId}: totalPoints=${derived.totalPoints} (group=${derived.groupPoints}, qualified=${derived.groupQualified})`,
      );
    }

    functions.logger.log(
      `[calculateGroupResults] Updated stats for ${predictorScores.size} predictors`,
    );

    try {
      await doRecomputeRanks(tournamentId);
      functions.logger.log(`[calculateGroupResults] Rank recompute completed`);
    } catch (err) {
      functions.logger.error(
        '[calculateGroupResults] Rank recompute failed after group scoring',
        err,
      );
    }

    return null;
  });
