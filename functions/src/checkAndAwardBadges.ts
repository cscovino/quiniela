import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
  lastUpdated: admin.firestore.Timestamp;
}

interface BadgeCondition {
  badgeId: string;
  check: (stats: PredictorStatsData) => boolean;
}

const BADGE_CONDITIONS: BadgeCondition[] = [
  {
    badgeId: 'first-blood',
    check: (stats) => stats.totalBets >= 1,
  },
  {
    badgeId: 'on-fire',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    badgeId: 'consistent',
    check: (stats) => stats.winnerBets >= 10,
  },
  {
    badgeId: 'perfect-group',
    check: (stats) => stats.exactBets >= 6,
  },
];

export const checkAndAwardBadges = functions.firestore
  .document('users/{userId}/predictors/{predictorId}/stats/{tournamentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as PredictorStatsData;
    const after = change.after.data() as PredictorStatsData;

    const existingBadges = before.badgesAwarded || {};
    const newBadges: Record<string, string> = { ...existingBadges };
    let awardedAny = false;

    for (const { badgeId, check } of BADGE_CONDITIONS) {
      if (!existingBadges[badgeId] && check(after)) {
        newBadges[badgeId] = new Date().toISOString();
        awardedAny = true;

        functions.logger.log(
          `Awarding badge ${badgeId} to predictor ${context.params.predictorId}`,
        );
      }
    }

    if (!awardedAny) {
      return null;
    }

    await change.after.ref.update({
      badgesAwarded: newBadges,
    });

    const notificationBatch = db.batch();

    for (const [badgeId] of Object.entries(newBadges)) {
      if (!existingBadges[badgeId]) {
        const notificationRef = db
          .collection(`users/${context.params.userId}/notifications`)
          .doc();

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
