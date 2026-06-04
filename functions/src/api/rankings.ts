import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

import { withAppCheck } from './withAppCheck';

const db = admin.firestore();

interface PointsHistoryEntry {
  timestamp: admin.firestore.Timestamp;
  points: number;
  matchId?: string;
}

export interface SortedStat {
  id: string;
  userId: string;
  predictorId: string;
  totalPoints: number;
  accuracy: number;
  currentStreak: number;
  exactBets: number;
  badgesAwarded: Record<string, string>;
  pointsHistory: Array<{ timestamp: number; points: number }>;
}

export interface PredictorProfile {
  name: string;
  avatarUrl: string | null;
  avatar: { bgColor?: string; emoji?: string } | null;
  pixelArt: { seed: string; options: Record<string, unknown> } | null;
}

export function buildRankingEntries(
  sorted: SortedStat[],
  profileMap: Map<string, PredictorProfile>,
) {
  return sorted.map((s, i) => {
    const key = `users/${s.userId}/predictors/${s.predictorId}`;
    const profile = profileMap.get(key);
    return {
      id: s.id,
      rank: i + 1,
      userId: s.userId,
      predictorId: s.predictorId,
      displayName: profile?.name || s.predictorId,
      avatarUrl: profile?.avatarUrl || null,
      avatar:
        profile?.avatar?.bgColor && profile?.avatar?.emoji
          ? { bgColor: profile.avatar.bgColor, emoji: profile.avatar.emoji }
          : null,
      pixelArt: profile?.pixelArt ?? null,
      totalPoints: s.totalPoints,
      accuracy: s.accuracy,
      currentStreak: s.currentStreak,
      exactBets: s.exactBets,
      badgesAwarded: s.badgesAwarded,
      pointsHistory: s.pointsHistory,
    };
  });
}

interface StatsDocData {
  totalPoints?: number;
  accuracy?: number;
  currentStreak?: number;
  exactBets?: number;
  badgesAwarded?: Record<string, string>;
  pointsHistory?: PointsHistoryEntry[];
}

interface MinimalDoc {
  id: string;
  ref: { path: string };
  data: () => Record<string, unknown>;
}

/**
 * Merge predictors and stats snapshots into a single SortedStat[].
 *
 * - Predictors with a matching stats doc use the stats (points, accuracy, etc.)
 * - Predictors without a stats doc get a zero-points entry (so the leaderboard
 *   shows them as "ready to play", not absent)
 * - Orphaned stats (no matching predictor doc) are kept so historical
 *   participants don't drop off the board
 */
export function mergePredictorStats(
  predictorsSnap: MinimalDoc[],
  statsSnap: MinimalDoc[],
): SortedStat[] {
  const statsByKey = new Map<string, SortedStat>();

  statsSnap.forEach((doc) => {
    const pathParts = doc.ref.path.split('/');
    const userId = pathParts[1];
    const predictorId = pathParts[3];
    const data = doc.data() as StatsDocData;
    const history = data.pointsHistory || [];
    statsByKey.set(`${userId}/${predictorId}`, {
      id: doc.id,
      userId,
      predictorId,
      totalPoints: data.totalPoints || 0,
      accuracy: data.accuracy || 0,
      currentStreak: data.currentStreak || 0,
      exactBets: data.exactBets || 0,
      badgesAwarded: data.badgesAwarded || {},
      // Serialize Firestore Timestamps to epoch ms so the client can
      // reconstruct Dates over JSON (Timestamps don't survive res.json()).
      pointsHistory: history.map((h) => ({
        timestamp: h.timestamp?.toMillis ? h.timestamp.toMillis() : 0,
        points: h.points,
      })),
    });
  });

  const merged: SortedStat[] = [];
  const seen = new Set<string>();

  predictorsSnap.forEach((doc) => {
    const pathParts = doc.ref.path.split('/');
    const userId = pathParts[1];
    const predictorId = pathParts[3];
    const key = `${userId}/${predictorId}`;
    seen.add(key);
    const existing = statsByKey.get(key);
    if (existing) {
      merged.push(existing);
    } else {
      merged.push({
        id: doc.id,
        userId,
        predictorId,
        totalPoints: 0,
        accuracy: 0,
        currentStreak: 0,
        exactBets: 0,
        badgesAwarded: {},
        pointsHistory: [],
      });
    }
  });

  for (const [key, stat] of statsByKey) {
    if (!seen.has(key)) merged.push(stat);
  }

  return merged;
}

export const rankings = functions.runWith({ minInstances: 0 }).https.onRequest(
  withAppCheck(async (req, res) => {
    try {
      const [predictorsSnap, statsSnap] = await Promise.all([
        db.collectionGroup('predictors').get(),
        db.collectionGroup('stats').get(),
      ]);

      const merged = mergePredictorStats(
        predictorsSnap.docs as unknown as MinimalDoc[],
        statsSnap.docs as unknown as MinimalDoc[],
      );

      const sorted = merged
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 100);

      const predictorRefs = new Set<string>();
      for (const s of sorted) {
        predictorRefs.add(`users/${s.userId}/predictors/${s.predictorId}`);
      }

      const predictorDocs = await Promise.all(
        Array.from(predictorRefs).map(async (ref) => {
          const snap = await db.doc(ref).get();
          const data = snap.exists ? snap.data() : null;
          return {
            id: ref,
            name: (data?.name as string) || null,
            avatarUrl: (data?.avatarUrl as string | null) || null,
            avatar: (data?.avatar as { bgColor?: string; emoji?: string } | null) || null,
            pixelArt:
              (data?.pixelArt as { seed: string; options: Record<string, unknown> } | null) ?? null,
          };
        }),
      );

      const profileMap = new Map<string, PredictorProfile>();
      for (const p of predictorDocs) {
        profileMap.set(p.id, {
          name: p.name || p.id.split('/').pop() || 'Unknown',
          avatarUrl: p.avatarUrl,
          avatar: p.avatar,
          pixelArt: p.pixelArt,
        });
      }

      res.json(buildRankingEntries(sorted, profileMap));
    } catch (error) {
      functions.logger.error('rankings function error:', error);
      res.status(500).json({ error: 'Failed to fetch rankings' });
    }
  }, 'public, s-maxage=60, stale-while-revalidate=300'),
);
