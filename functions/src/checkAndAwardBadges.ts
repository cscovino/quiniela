import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

const db = admin.firestore();

interface PredictorStatsData {
  predictorId: string;
  tournamentId: string;
  totalPoints: number;
  exactBets: number;
  winnerBets: number;
  totalBets: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  pointsHistory: { timestamp: admin.firestore.Timestamp; points: number; matchId: string }[];
  badgesAwarded: Record<string, string>;
  rank?: number;
  percentile?: number;
  lastRankUpdate?: admin.firestore.Timestamp;
  lastUpdated: admin.firestore.Timestamp;
  groupQualified?: number;
}

interface BadgeCondition {
  badgeId: string;
  check: (stats: PredictorStatsData) => boolean;
}

const BADGE_CONDITIONS: BadgeCondition[] = [
  {
    badgeId: 'first-blood',
    check: (stats) => stats.exactBets >= 1,
  },
  {
    badgeId: 'on-fire',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    badgeId: 'consistent',
    check: (stats) => stats.winnerBets >= 20,
  },
  {
    badgeId: 'perfect-group',
    check: (stats) => (stats.groupQualified ?? 0) >= 16,
  },
  {
    badgeId: 'top-10',
    check: (stats) => (stats.percentile ?? 1) <= 0.1,
  },
];

export function getBadgeAwards(
  beforeBadges: Record<string, string>,
  afterStats: PredictorStatsData,
): Record<string, string> {
  const existingBadges = beforeBadges || {};
  const newBadges: Record<string, string> = { ...existingBadges };

  for (const { badgeId, check } of BADGE_CONDITIONS) {
    if (!existingBadges[badgeId] && check(afterStats)) {
      newBadges[badgeId] = new Date().toISOString();
    }
  }

  return newBadges;
}

export const checkAndAwardBadges = functions.firestore
  .document('users/{userId}/predictors/{predictorId}/stats/{tournamentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as PredictorStatsData;
    const after = change.after.data() as PredictorStatsData;

    const existingBadges = before.badgesAwarded || {};
    const newBadges = getBadgeAwards(existingBadges, after);

    const awardedAny = Object.keys(newBadges).some((k) => !existingBadges[k]);

    if (!awardedAny) {
      return null;
    }

    for (const [badgeId] of Object.entries(newBadges)) {
      if (!existingBadges[badgeId]) {
        functions.logger.log(
          `Awarding badge ${badgeId} to predictor ${context.params.predictorId}`,
        );
      }
    }

    await change.after.ref.update({
      badgesAwarded: newBadges,
    });

    const tournamentId = context.params.tournamentId;
    const predictorId = context.params.predictorId;

    const finalPhaseBetSnap = await db
      .doc(`tournaments/${tournamentId}/final_phase_bets/${predictorId}`)
      .get();
    const finalStandingsSnap = await db
      .doc(`tournaments/${tournamentId}/final_standings/final`)
      .get();

    const predictedChampion = finalPhaseBetSnap.data()?.first;
    const actualChampion = finalStandingsSnap.data()?.first;

    if (
      !newBadges['clairvoyant'] &&
      predictedChampion &&
      actualChampion &&
      predictedChampion === actualChampion
    ) {
      newBadges['clairvoyant'] = new Date().toISOString();
      await change.after.ref.update({
        badgesAwarded: newBadges,
      });
    }

    const notificationBatch = db.batch();

    for (const [badgeId] of Object.entries(newBadges)) {
      if (!existingBadges[badgeId]) {
        const notificationRef = db.collection(`users/${context.params.userId}/notifications`).doc();

        notificationBatch.set(notificationRef, {
          type: 'badge_earned',
          title: 'Badge Earned!',
          message: `You earned the ${badgeId} badge!`,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    await notificationBatch.commit();

    return null;
  });
