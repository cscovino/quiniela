import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

import { withAppCheck } from './withAppCheck';

const db = admin.firestore();

interface PointsHistoryEntry {
  timestamp: admin.firestore.Timestamp;
  points: number;
  matchId?: string;
}

export const rankings = functions.runWith({ minInstances: 0 }).https.onRequest(
  withAppCheck(async (req, res) => {
    try {
      const statsSnap = await db.collectionGroup('stats').get();

      const allStats: Array<{
        id: string;
        userId: string;
        predictorId: string;
        totalPoints: number;
        accuracy: number;
        currentStreak: number;
        exactBets: number;
        badgesAwarded: Record<string, string>;
        pointsHistory: Array<{ timestamp: number; points: number }>;
      }> = [];

      statsSnap.forEach((doc) => {
        const refPath = doc.ref.path;
        const pathParts = refPath.split('/');
        const userId = pathParts[1];
        const predictorId = pathParts[3];
        const data = doc.data();
        const history = (data.pointsHistory as PointsHistoryEntry[] | undefined) || [];
        allStats.push({
          id: doc.id,
          userId,
          predictorId,
          totalPoints: data.totalPoints || 0,
          accuracy: data.accuracy || 0,
          currentStreak: data.currentStreak || 0,
          exactBets: data.exactBets || 0,
          badgesAwarded: (data.badgesAwarded as Record<string, string>) || {},
          // Serialize Firestore Timestamps to epoch ms so the client can
          // reconstruct Dates over JSON (Timestamps don't survive res.json()).
          pointsHistory: history.map((h) => ({
            timestamp: h.timestamp?.toMillis ? h.timestamp.toMillis() : 0,
            points: h.points,
          })),
        });
      });

      const sorted = allStats.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 100);

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
          };
        }),
      );

      const profileMap = new Map<
        string,
        {
          name: string;
          avatarUrl: string | null;
          avatar: { bgColor?: string; emoji?: string } | null;
        }
      >();
      for (const p of predictorDocs) {
        profileMap.set(p.id, {
          name: p.name || p.id.split('/').pop() || 'Unknown',
          avatarUrl: p.avatarUrl,
          avatar: p.avatar,
        });
      }

      const rankings = sorted.map((s, i) => {
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
          totalPoints: s.totalPoints,
          accuracy: s.accuracy,
          currentStreak: s.currentStreak,
          exactBets: s.exactBets,
          badgesAwarded: s.badgesAwarded,
          pointsHistory: s.pointsHistory,
        };
      });

      res.json(rankings);
    } catch (error) {
      functions.logger.error('rankings function error:', error);
      res.status(500).json({ error: 'Failed to fetch rankings' });
    }
  }, 'public, s-maxage=60, stale-while-revalidate=300'),
);
