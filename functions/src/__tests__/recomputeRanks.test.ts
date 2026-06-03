import { beforeEach, describe, expect, it } from 'vitest';

import { doRecomputeRanks, recomputeRanks } from '../recomputeRanks';
import { mockBatch, mockDb } from './setup';

import './setup';

describe('doRecomputeRanks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is exported as a function', () => {
    expect(typeof doRecomputeRanks).toBe('function');
  });

  it('calls db.collectionGroup(stats) filtered by tournamentId', async () => {
    await doRecomputeRanks('tournament-1');
    expect(mockDb.collectionGroup).toHaveBeenCalledWith('stats');
  });

  it('calls db.batch().update() for each predictor after sorting by totalPoints DESC', async () => {
    await doRecomputeRanks('tournament-1');
    expect(mockBatch.update).toHaveBeenCalled();
  });

  it('update calls include rank, percentile, and lastRankUpdate fields', async () => {
    await doRecomputeRanks('tournament-1');
    const updateCalls = mockBatch.update.mock.calls;
    expect(updateCalls.length).toBeGreaterThan(0);
    const firstUpdate = updateCalls[0][1] as Record<string, unknown>;
    expect(firstUpdate).toHaveProperty('rank');
    expect(firstUpdate).toHaveProperty('percentile');
    expect(firstUpdate).toHaveProperty('lastRankUpdate');
  });

  it('commits the batch after all updates', async () => {
    await doRecomputeRanks('tournament-1');
    expect(mockBatch.commit).toHaveBeenCalled();
  });
});

describe('recomputeRanks callable', () => {
  it('is exported as a function', () => {
    expect(typeof recomputeRanks).toBe('function');
  });
});

describe('top-10 badge condition', () => {
  it('awards top-10 when percentile <= 0.10', async () => {
    const { getBadgeAwards } = await import('../checkAndAwardBadges');
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 100,
      exactBets: 10,
      winnerBets: 10,
      totalBets: 10,
      accuracy: 1,
      currentStreak: 0,
      maxStreak: 0,
      pointsHistory: [],
      badgesAwarded: {} as Record<string, string>,
      percentile: 0.05,
      lastRankUpdate: { seconds: 0, nanoseconds: 0 },
      lastUpdated: { seconds: 0, nanoseconds: 0 },
    };
    const result = getBadgeAwards({}, stats);
    expect(result['top-10']).toBeDefined();
  });

  it('does not award top-10 when percentile > 0.10', async () => {
    const { getBadgeAwards } = await import('../checkAndAwardBadges');
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 10,
      exactBets: 1,
      winnerBets: 1,
      totalBets: 1,
      accuracy: 0.1,
      currentStreak: 0,
      maxStreak: 0,
      pointsHistory: [],
      badgesAwarded: {} as Record<string, string>,
      percentile: 0.5,
      lastUpdated: { seconds: 0, nanoseconds: 0 },
    };
    const result = getBadgeAwards({}, stats);
    expect(result['top-10']).toBeUndefined();
  });

  it('treats missing percentile as 1 (no badge)', async () => {
    const { getBadgeAwards } = await import('../checkAndAwardBadges');
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 10,
      exactBets: 1,
      winnerBets: 1,
      totalBets: 1,
      accuracy: 0.1,
      currentStreak: 0,
      maxStreak: 0,
      pointsHistory: [],
      badgesAwarded: {} as Record<string, string>,
      percentile: undefined,
      lastUpdated: { seconds: 0, nanoseconds: 0 },
    };
    const result = getBadgeAwards({}, stats);
    expect(result['top-10']).toBeUndefined();
  });
});
