import type { AvatarOptions } from '@app-types/firestore';

import { getAppCheckToken } from './firebase';

/**
 * A ranking entry as returned by the `/api/rankings` Cloud Function
 * (functions/src/api/rankings.ts). The function runs the `collectionGroup('stats')`
 * scan and the per-predictor profile reads server-side (Admin SDK, cached 60s),
 * so the client makes a single request instead of N+1 Firestore reads. This is
 * also why the client never needs a `collectionGroup` security rule.
 */
export interface ApiRankingEntry {
  id: string;
  rank: number;
  userId: string;
  predictorId: string;
  displayName: string;
  avatarUrl: string | null;
  avatar: { bgColor: string; emoji: string } | null;
  pixelArt?: { seed: string; options: AvatarOptions } | null;
  favouriteTeamId?: string | null;
  totalPoints: number;
  /** Raw accuracy in the 0..1 range (multiply by 100 for a percentage). */
  accuracy: number;
  currentStreak: number;
  exactBets: number;
  badgesAwarded: Record<string, string>;
  /** Points history with timestamps serialized as epoch milliseconds. */
  pointsHistory: Array<{ timestamp: number; points: number }>;
}

/**
 * Fetch the tournament rankings from the server function. Sorted by total
 * points descending, capped at the server-side top 100.
 *
 * Throws on a non-2xx response or network failure so callers can decide
 * whether to fall back (e.g. keep server-rendered initial data).
 */
export async function fetchRankingsFromApi(): Promise<ApiRankingEntry[]> {
  const token = await getAppCheckToken();
  const res = await fetch('/api/rankings', {
    headers: token ? { 'X-Firebase-AppCheck': token } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Rankings API responded with ${res.status}`);
  }
  return (await res.json()) as ApiRankingEntry[];
}
