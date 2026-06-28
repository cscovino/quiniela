import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import {
  type AllGroupStandings,
  scoreGroupBet,
  type ScoringPhase,
  type TeamStanding,
} from './groupScoring';
import { recomputePredictorTotals } from './recomputePredictorTotals';
import { doRecomputeRanks } from './recomputeRanks';

export { scoreGroupBet };
export type { AllGroupStandings, ScoringPhase, TeamStanding };

const db = admin.firestore();

// -- Types --

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

    if (after.pointsCalculated) {
      functions.logger.log(
        `[calculateGroupResults] Group ${groupId} already scored (pointsCalculated=true) — skipping`,
      );
      return null;
    }

    const standings = after.standings;

    if (!standings || standings.length === 0) {
      functions.logger.error(`[calculateGroupResults] Group ${groupId} has no standings`);
      return null;
    }

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

    const predictorScores: Map<string, { userId: string; points: number; exactQualified: number }> =
      new Map();

    const batch = db.batch();

    for (const betDoc of betsSnapshot.docs) {
      const bet = betDoc.data() as GroupBetData;
      const { points, exactQualified } = scoreGroupBet(
        bet.positions,
        standings,
        'positions-1-and-2',
      );

      batch.update(betDoc.ref, {
        points,
        exactQualified,
        thirdPlaceScored: false,
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

    batch.update(change.after.ref, {
      pointsCalculated: true,
    });

    await batch.commit();
    functions.logger.log(
      `[calculateGroupResults] Committed batch: ${betsSnapshot.size} group bets scored`,
    );

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

    const allStandingsSnap = await db
      .collection(`tournaments/${tournamentId}/group_standings`)
      .get();
    const allGroupsDone = allStandingsSnap.docs.every(
      (d) => (d.data() as GroupStandingsData).pointsCalculated === true,
    );

    if (allGroupsDone) {
      functions.logger.log(
        `[calculateGroupResults] All groups done — triggering third-place scoring`,
      );
      try {
        await runThirdPlaceScoring(tournamentId);
        functions.logger.log(`[calculateGroupResults] Third-place scoring completed`);
      } catch (err) {
        functions.logger.error('[calculateGroupResults] Third-place scoring failed', err);
      }
    }

    return null;
  });

// -- Phase 2: Third-place scoring (shared logic) --

async function runThirdPlaceScoring(tournamentId: string): Promise<number> {
  functions.logger.log(
    `[calculateThirdPlaceResults] Starting third-place scoring for ${tournamentId}`,
  );

  const allStandingsSnap = await db.collection(`tournaments/${tournamentId}/group_standings`).get();
  const allGroupStandings: AllGroupStandings = {};
  for (const doc of allStandingsSnap.docs) {
    const data = doc.data() as GroupStandingsData;
    if (data.standings && data.standings.length > 0) {
      allGroupStandings[doc.id] = data.standings;
    }
  }

  const betsSnap = await db
    .collection(`tournaments/${tournamentId}/group_bets`)
    .where('thirdPlaceScored', '==', false)
    .get();

  functions.logger.log(
    `[calculateThirdPlaceResults] Found ${betsSnap.size} bets to score for third place`,
  );

  if (betsSnap.empty) {
    return 0;
  }

  const batch = db.batch();
  const predictorScores: Map<string, { userId: string; additionalPoints: number }> = new Map();

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data() as GroupBetData;
    const standings = allGroupStandings[bet.groupId];
    if (!standings || standings.length < 3) continue;

    if (bet.classifiedTeamIds && bet.classifiedTeamIds.length > 0) {
      functions.logger.log(
        `[calculateThirdPlaceResults] Bet ${betDoc.id} already has classifiedTeamIds — skipping (recalculateGroupPoints will handle it)`,
      );
      continue;
    }

    const { points: thirdPlacePoints } = scoreGroupBet(
      bet.positions,
      standings,
      'position-3',
      allGroupStandings,
    );

    const newTotalPoints = (bet.points || 0) + thirdPlacePoints;

    batch.update(betDoc.ref, {
      points: newTotalPoints,
      thirdPlaceScored: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const existing = predictorScores.get(bet.predictorId);
    if (existing) {
      existing.additionalPoints += thirdPlacePoints;
    } else {
      predictorScores.set(bet.predictorId, {
        userId: bet.userId,
        additionalPoints: thirdPlacePoints,
      });
    }

    functions.logger.log(
      `[calculateThirdPlaceResults] Bet ${betDoc.id}: added ${thirdPlacePoints} third-place pts (total now ${newTotalPoints})`,
    );
  }

  await batch.commit();
  functions.logger.log(
    `[calculateThirdPlaceResults] Committed ${betsSnap.size} third-place updates`,
  );

  for (const [predictorId, score] of predictorScores) {
    await recomputePredictorTotals(score.userId, predictorId, tournamentId);
  }

  try {
    await doRecomputeRanks(tournamentId);
  } catch (err) {
    functions.logger.error('[calculateThirdPlaceResults] Rank recompute failed', err);
  }

  return betsSnap.size;
}

// -- Phase 2 callable (for manual re-runs if needed) --

export const calculateThirdPlaceResults = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const tournamentId = data?.tournamentId as string | undefined;
  if (!tournamentId) {
    throw new functions.https.HttpsError('invalid-argument', 'tournamentId is required');
  }

  const allMatchesSnap = await db
    .collection(`tournaments/${tournamentId}/matches`)
    .where('groupId', '!=', null)
    .get();
  const totalMatches = allMatchesSnap.size;
  const finishedMatches = allMatchesSnap.docs.filter(
    (d) => (d.data() as { status?: string }).status === 'finished',
  ).length;

  if (finishedMatches < totalMatches) {
    functions.logger.warn(
      `[calculateThirdPlaceResults] Group stage not complete (${finishedMatches}/${totalMatches}) — aborting`,
    );
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Group stage not complete: ${finishedMatches}/${totalMatches} matches finished`,
    );
  }

  const scored = await runThirdPlaceScoring(tournamentId);
  return { scored };
});
