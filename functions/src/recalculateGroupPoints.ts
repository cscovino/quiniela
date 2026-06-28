import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { type AllGroupStandings, scoreGroupBet, type TeamStanding } from './groupScoring';
import { recomputePredictorTotals } from './recomputePredictorTotals';
import { doRecomputeRanks } from './recomputeRanks';

const db = admin.firestore();

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
  classifiedTeamIds?: string[];
  points: number;
  exactMatches?: number;
  wrongPositionMatches?: number;
  exactQualified?: number;
  thirdPlaceScored?: boolean;
  scoredAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

export const recalculateGroupPoints = functions.firestore
  .document('tournaments/{tournamentId}/group_bets/{betId}')
  .onUpdate(async (change, context) => {
    const tournamentId = context.params.tournamentId;
    const betId = context.params.betId;
    const before = change.before.data() as GroupBetData;
    const after = change.after.data() as GroupBetData;

    const beforeIds = JSON.stringify(
      (before.classifiedTeamIds || []).map((t) => t.toUpperCase()).sort(),
    );
    const afterIds = JSON.stringify(
      (after.classifiedTeamIds || []).map((t) => t.toUpperCase()).sort(),
    );

    if (beforeIds === afterIds) {
      return null;
    }

    if (!after.classifiedTeamIds || after.classifiedTeamIds.length === 0) {
      functions.logger.log(
        `[recalculateGroupPoints] Bet ${betId} has no classifiedTeamIds — skipping`,
      );
      return null;
    }

    functions.logger.log(
      `[recalculateGroupPoints] Bet ${betId} classifiedTeamIds changed: ${beforeIds} → ${afterIds}`,
    );

    const standingsSnap = await db
      .collection(`tournaments/${tournamentId}/group_standings`)
      .doc(after.groupId)
      .get();

    if (!standingsSnap.exists) {
      functions.logger.warn(
        `[recalculateGroupPoints] No standings found for group ${after.groupId} — skipping`,
      );
      return null;
    }

    const standings = (standingsSnap.data() as GroupStandingsData).standings;
    if (!standings || standings.length === 0) {
      functions.logger.warn(
        `[recalculateGroupPoints] Empty standings for group ${after.groupId} — skipping`,
      );
      return null;
    }

    const allStandingsSnap = await db
      .collection(`tournaments/${tournamentId}/group_standings`)
      .get();
    const allGroupStandings: AllGroupStandings = {};
    for (const doc of allStandingsSnap.docs) {
      const data = doc.data() as GroupStandingsData;
      if (data.standings && data.standings.length > 0) {
        allGroupStandings[doc.id] = data.standings;
      }
    }

    const result = scoreGroupBet(
      after.positions,
      standings,
      'all',
      allGroupStandings,
      after.classifiedTeamIds,
    );

    await change.after.ref.update({
      points: result.points,
      exactMatches: result.exactMatches,
      wrongPositionMatches: result.wrongPositionMatches,
      exactQualified: result.exactQualified,
      thirdPlaceScored: true,
      scoredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    functions.logger.log(
      `[recalculateGroupPoints] Bet ${betId} (predictor=${after.predictorId}, group=${after.groupId}) scored ${result.points} pts (${result.exactMatches} exact, ${result.wrongPositionMatches} wrong-pos)`,
    );

    await recomputePredictorTotals(after.userId, after.predictorId, tournamentId);

    try {
      await doRecomputeRanks(tournamentId);
    } catch (err) {
      functions.logger.error('[recalculateGroupPoints] Rank recompute failed', err);
    }

    return null;
  });
