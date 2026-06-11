import { describe, expect, it } from 'vitest';

import type { DbClient, QueryOptions, RowDoc } from '../build-data';
import { groupPredictedBets, queryBuildRankings } from '../build-data';

interface DocStub {
  id: string;
  ref: { path: string };
  data: () => Record<string, unknown>;
  exists?: boolean;
}

const makeSnap = (path: string, data: Record<string, unknown>, exists = true): DocStub => ({
  id: path,
  ref: { path },
  data: () => data,
  exists,
});

function makeDb(
  predictors: DocStub[],
  stats: DocStub[],
  predictorDocs: Record<string, RowDoc | null> = {},
): DbClient {
  return {
query: async <T = unknown>(
      _path: string, // eslint-disable-line @typescript-eslint/no-unused-vars
      _opts: QueryOptions, // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<{ forEach: (cb: (doc: T) => void) => void }> =>
      Promise.resolve({
        forEach: (cb: (doc: T) => void) => {
          for (const p of predictors) cb(p as unknown as T);
        },
      }),
    collectionGroup: async (id: string) => ({
      forEach: (cb: (doc: DocStub) => void) => {
        const list = id === 'predictors' ? predictors : stats;
        for (const d of list) cb(d);
      },
    }),
    doc: async (path: string) => {
      if (Object.hasOwn(predictorDocs, path)) {
        return predictorDocs[path] as RowDoc;
      }
      const stub = predictors.find((p) => p.ref.path === path);
      if (stub) {
        return stub as unknown as RowDoc;
      }
      return makeSnap(path, {}, false) as unknown as RowDoc;
    },
  };
}

describe('queryBuildRankings', () => {
  it('hydrates pixelArt on each ranking row from the predictor doc', async () => {
    const predictors: DocStub[] = [
      makeSnap('users/u1/predictors/p1', {}),
      makeSnap('users/u1/predictors/p2', {}),
    ];
    const stats: DocStub[] = [
      makeSnap('users/u1/predictors/p1/stats', {
        totalPoints: 30,
        accuracy: 0.8,
        currentStreak: 2,
        exactBets: 1,
        pointsHistory: [],
        badgesAwarded: {},
        lastUpdated: { seconds: 0, nanoseconds: 0 },
      }),
      makeSnap('users/u1/predictors/p2/stats', {
        totalPoints: 20,
        accuracy: 0.6,
        currentStreak: 1,
        exactBets: 0,
        pointsHistory: [],
        badgesAwarded: {},
        lastUpdated: { seconds: 0, nanoseconds: 0 },
      }),
    ];
    const db = makeDb(predictors, stats, {
      'users/u1/predictors/p1': makeSnap('users/u1/predictors/p1', {
        name: 'Alice',
        avatar: { bgColor: '#fff', emoji: '🦊' },
        pixelArt: { seed: 'alice-seed', options: { colorful: true } },
      }) as unknown as RowDoc,
      'users/u1/predictors/p2': makeSnap('users/u1/predictors/p2', {
        name: 'Bob',
        avatar: { bgColor: '#000', emoji: '🐺' },
        pixelArt: null,
      }) as unknown as RowDoc,
    });

    const rankings = await queryBuildRankings(db);
    const alice = rankings.find((r) => r.predictorId === 'p1');
    const bob = rankings.find((r) => r.predictorId === 'p2');

    expect(alice?.pixelArt).toEqual({ seed: 'alice-seed', options: { colorful: true } });
    expect(bob?.pixelArt).toBeUndefined();
  });

  it('falls back to undefined pixelArt when predictor doc is missing', async () => {
    const predictors: DocStub[] = [makeSnap('users/u1/predictors/p1', {})];
    const stats: DocStub[] = [
      makeSnap('users/u1/predictors/p1/stats', {
        totalPoints: 5,
        accuracy: 0.1,
        currentStreak: 0,
        exactBets: 0,
        pointsHistory: [],
        badgesAwarded: {},
        lastUpdated: { seconds: 0, nanoseconds: 0 },
      }),
    ];
    const db = makeDb(predictors, stats);

    const rankings = await queryBuildRankings(db);
    expect(rankings[0]?.pixelArt).toBeUndefined();
    expect(rankings[0]?.displayName).toBe('p1');
  });

  it('ranks predictors by totalPoints descending', async () => {
    const predictors: DocStub[] = [
      makeSnap('users/u1/predictors/p1', {}),
      makeSnap('users/u1/predictors/p2', {}),
      makeSnap('users/u1/predictors/p3', {}),
    ];
    const stats: DocStub[] = [
      makeSnap('users/u1/predictors/p1/stats', {
        totalPoints: 10,
        accuracy: 0.5,
        currentStreak: 0,
        exactBets: 0,
      }),
      makeSnap('users/u1/predictors/p2/stats', {
        totalPoints: 50,
        accuracy: 0.9,
        currentStreak: 5,
        exactBets: 2,
      }),
      makeSnap('users/u1/predictors/p3/stats', {
        totalPoints: 30,
        accuracy: 0.7,
        currentStreak: 1,
        exactBets: 1,
      }),
    ];
    const db = makeDb(predictors, stats, {
      'users/u1/predictors/p1': makeSnap('users/u1/predictors/p1', { name: 'A' }) as unknown as RowDoc,
      'users/u1/predictors/p2': makeSnap('users/u1/predictors/p2', { name: 'B' }) as unknown as RowDoc,
      'users/u1/predictors/p3': makeSnap('users/u1/predictors/p3', { name: 'C' }) as unknown as RowDoc,
    });

    const rankings = await queryBuildRankings(db);
    expect(rankings.map((r) => r.predictorId)).toEqual(['p2', 'p3', 'p1']);
  });
});

describe('groupPredictedBets', () => {
  it('groups predicted scores by predictorId, keeping only ranked predictors', () => {
    const bets = [
      { predictorId: 'p1', matchId: 'm1', homeScore: 2, awayScore: 1 },
      { predictorId: 'p1', matchId: 'm2', homeScore: 0, awayScore: 0 },
      { predictorId: 'p2', matchId: 'm1', homeScore: 1, awayScore: 1 },
      { predictorId: 'p9', matchId: 'm1', homeScore: 3, awayScore: 0 }, // not ranked
    ];
    const result = groupPredictedBets(bets, new Set(['p1', 'p2']));

    expect(result.get('p1')).toEqual([
      { matchId: 'm1', homeScore: 2, awayScore: 1 },
      { matchId: 'm2', homeScore: 0, awayScore: 0 },
    ]);
    expect(result.get('p2')).toEqual([{ matchId: 'm1', homeScore: 1, awayScore: 1 }]);
    expect(result.has('p9')).toBe(false);
  });

  it('skips malformed bet docs (missing ids or non-numeric scores)', () => {
    const bets = [
      { predictorId: 'p1', matchId: 'm1', homeScore: 2, awayScore: 1 },
      { matchId: 'm2', homeScore: 1, awayScore: 0 }, // no predictorId
      { predictorId: 'p1', homeScore: 1, awayScore: 0 }, // no matchId
      { predictorId: 'p1', matchId: 'm3', homeScore: undefined, awayScore: 0 }, // bad score
    ];
    const result = groupPredictedBets(bets, new Set(['p1']));
    expect(result.get('p1')).toEqual([{ matchId: 'm1', homeScore: 2, awayScore: 1 }]);
  });
});

describe('queryBuildRankings — no top-N cap', () => {
  it('returns every predictor, not just the first 100', async () => {
    const count = 150;
    const predictors: DocStub[] = Array.from({ length: count }, (_, i) =>
      makeSnap(`users/u1/predictors/p${i}`, {}),
    );
    const stats: DocStub[] = Array.from({ length: count }, (_, i) =>
      makeSnap(`users/u1/predictors/p${i}/stats`, {
        totalPoints: i,
        accuracy: 0.5,
        currentStreak: 0,
        exactBets: 0,
      }),
    );
    const db = makeDb(predictors, stats);

    const rankings = await queryBuildRankings(db);
    expect(rankings).toHaveLength(count);
  });
});
