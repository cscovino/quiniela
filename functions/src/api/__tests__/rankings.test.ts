import { describe, expect, it } from 'vitest';

import { buildRankingEntries, mergePredictorStats } from '../rankings';

import '../../__tests__/setup';

function sampleStat(userId: string, predictorId: string) {
  return {
    id: `${predictorId}-stats`,
    userId,
    predictorId,
    totalPoints: 42,
    accuracy: 0.75,
    currentStreak: 2,
    exactBets: 5,
    badgesAwarded: {},
    pointsHistory: [],
  };
}

function makePredictorDoc(id: string, userId: string, predictorId: string) {
  return {
    id,
    ref: { path: `users/${userId}/predictors/${predictorId}` },
    data: () => ({ name: id }),
  };
}

function makeStatDoc(id: string, userId: string, predictorId: string, totalPoints: number) {
  return {
    id,
    ref: { path: `users/${userId}/predictors/${predictorId}/stats/world-cup-2026` },
    data: () => ({ totalPoints, pointsHistory: [] }),
  };
}

describe('buildRankingEntries', () => {
  it('includes pixelArt when the predictor profile has it', () => {
    const profileMap = new Map([
      [
        'users/u1/predictors/p1',
        {
          name: 'Carlos',
          avatarUrl: null,
          avatar: null,
          pixelArt: { seed: 'p1', options: { hair: 'short01' } },
          favouriteTeamId: null,
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry.pixelArt).toEqual({ seed: 'p1', options: { hair: 'short01' } });
  });

  it('returns pixelArt: null when the predictor doc has no pixelArt', () => {
    const profileMap = new Map([
      [
        'users/u1/predictors/p1',
        {
          name: 'Carlos',
          avatarUrl: null,
          avatar: null,
          pixelArt: null,
          favouriteTeamId: null,
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry.pixelArt).toBeNull();
  });

  it('retains avatar and avatarUrl for back-compat (SC#4)', () => {
    const profileMap = new Map([
      [
        'users/u1/predictors/p1',
        {
          name: 'Carlos',
          avatarUrl: 'https://example.com/avatar.png',
          avatar: { bgColor: '#ff0000', emoji: '🏆' },
          pixelArt: null,
          favouriteTeamId: null,
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry).toHaveProperty('avatar');
    expect(entry).toHaveProperty('avatarUrl');
  });

  it('threads favouriteTeamId from the predictor profile to the entry', () => {
    const profileMap = new Map([
      [
        'users/u1/predictors/p1',
        {
          name: 'Carlos',
          avatarUrl: null,
          avatar: null,
          pixelArt: null,
          favouriteTeamId: 'ARG',
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry.favouriteTeamId).toBe('ARG');
  });

  it('returns favouriteTeamId: null when the predictor doc has no favouriteTeamId', () => {
    const profileMap = new Map([
      [
        'users/u1/predictors/p1',
        {
          name: 'Carlos',
          avatarUrl: null,
          avatar: null,
          pixelArt: null,
          favouriteTeamId: null,
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry.favouriteTeamId).toBeNull();
  });
});

describe('mergePredictorStats', () => {
  it('includes predictors without stats as zero-point entries', () => {
    const predictors = [makePredictorDoc('p1', 'u1', 'p1'), makePredictorDoc('p2', 'u1', 'p2')];
    const stats = [makeStatDoc('p1-stats', 'u1', 'p1', 100)];

    const merged = mergePredictorStats(predictors, stats);

    const p1 = merged.find((m) => m.predictorId === 'p1');
    const p2 = merged.find((m) => m.predictorId === 'p2');
    expect(p1?.totalPoints).toBe(100);
    expect(p2?.totalPoints).toBe(0);
    expect(p2?.userId).toBe('u1');
    expect(p2?.pointsHistory).toEqual([]);
  });

  it('uses stats points when both predictor and stats exist', () => {
    const predictors = [makePredictorDoc('p1', 'u1', 'p1')];
    const stats = [makeStatDoc('p1-stats', 'u1', 'p1', 250)];

    const merged = mergePredictorStats(predictors, stats);

    expect(merged).toHaveLength(1);
    expect(merged[0].totalPoints).toBe(250);
  });

  it('keeps orphaned stats whose predictor doc is missing', () => {
    const predictors = [makePredictorDoc('p1', 'u1', 'p1')];
    const stats = [
      makeStatDoc('p1-stats', 'u1', 'p1', 50),
      makeStatDoc('p2-stats', 'u1', 'p2', 80),
    ];

    const merged = mergePredictorStats(predictors, stats);

    expect(merged).toHaveLength(2);
    const ids = merged.map((m) => m.predictorId).sort();
    expect(ids).toEqual(['p1', 'p2']);
  });

  it('returns empty array when both snapshots are empty', () => {
    expect(mergePredictorStats([], [])).toEqual([]);
  });
});
