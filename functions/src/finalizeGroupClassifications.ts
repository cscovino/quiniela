import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

import {
  type AllGroupStandings,
  getTop8ThirdPlaceTeamIds,
  type TeamStanding,
} from './groupScoring';

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
  thirdPlaceScored?: boolean;
  scoredAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

function computeClassifiedTeamIds(
  positions: string[],
  top8ThirdPlaceTeamIds: Set<string>,
): string[] {
  const upper = (positions || []).map((p) => p.toUpperCase());
  const classified: string[] = [];
  if (upper[0]) classified.push(upper[0]);
  if (upper[1]) classified.push(upper[1]);
  if (upper[2] && top8ThirdPlaceTeamIds.has(upper[2])) classified.push(upper[2]);
  return classified;
}

export const finalizeGroupClassifications = functions.firestore
  .document('tournaments/{tournamentId}/group_standings/{groupId}')
  .onUpdate(async (change, context) => {
    const tournamentId = context.params.tournamentId;
    const groupId = context.params.groupId;
    const after = change.after.data() as GroupStandingsData;

    functions.logger.log(
      `[finalizeGroupClassifications] Triggered: tournament=${tournamentId}, group=${groupId}`,
    );

    if (!after.pointsCalculated) {
      functions.logger.log(
        `[finalizeGroupClassifications] Group ${groupId} not yet scored — skipping`,
      );
      return null;
    }

    const allStandingsSnap = await db
      .collection(`tournaments/${tournamentId}/group_standings`)
      .get();

    const allGroupStandings: AllGroupStandings = {};
    let allCalculated = true;
    for (const doc of allStandingsSnap.docs) {
      const data = doc.data() as GroupStandingsData;
      if (data.standings && data.standings.length > 0) {
        allGroupStandings[doc.id] = data.standings;
      }
      if (data.pointsCalculated !== true) {
        allCalculated = false;
      }
    }

    if (!allCalculated) {
      functions.logger.log(
        `[finalizeGroupClassifications] Not all groups calculated yet — deferring`,
      );
      return null;
    }

    const top8ThirdPlace = getTop8ThirdPlaceTeamIds(allGroupStandings);
    functions.logger.log(
      `[finalizeGroupClassifications] All groups calculated. Top 8 third-place teams: ${Array.from(
        top8ThirdPlace,
      ).join(', ')}`,
    );

    const betsSnap = await db.collection(`tournaments/${tournamentId}/group_bets`).get();

    functions.logger.log(
      `[finalizeGroupClassifications] Found ${betsSnap.size} group bets to refine`,
    );

    if (betsSnap.empty) {
      return null;
    }

    const batch = db.batch();
    let updated = 0;

    for (const betDoc of betsSnap.docs) {
      const bet = betDoc.data() as GroupBetData;
      const positions = (bet.positions || []).map((p) => p.toUpperCase());

      if (positions.length < 2) continue;

      const classifiedTeamIds = computeClassifiedTeamIds(positions, top8ThirdPlace);

      const current = (bet.classifiedTeamIds || []).map((t) => t.toUpperCase()).sort();
      const next = classifiedTeamIds.slice().sort();

      if (JSON.stringify(current) !== JSON.stringify(next)) {
        batch.update(betDoc.ref, { classifiedTeamIds });
        updated++;
      }
    }

    if (updated > 0) {
      await batch.commit();
      functions.logger.log(
        `[finalizeGroupClassifications] Refined classifiedTeamIds on ${updated} bets`,
      );
    } else {
      functions.logger.log(`[finalizeGroupClassifications] No bet changes needed`);
    }

    return null;
  });
