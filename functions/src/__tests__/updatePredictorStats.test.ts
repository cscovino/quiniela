import { describe, expect, it } from 'vitest';

import { computeStatsFromBets } from '../updatePredictorStats';

import './setup';

interface MockMatchStatus {
  status: string;
  date?: { toDate: () => Date };
}

const allFinished = new Map<string, MockMatchStatus>([
  ['m1', { status: 'finished' }],
  ['m2', { status: 'finished' }],
  ['m3', { status: 'finished' }],
  ['m4', { status: 'finished' }],
  ['m5', { status: 'finished' }],
  ['m6', { status: 'finished' }],
]);

describe('computeStatsFromBets', () => {
  it('returns zeros for empty bets array', () => {
    const result = computeStatsFromBets([], new Map());
    expect(result.totalPoints).toBe(0);
    expect(result.exactBets).toBe(0);
    expect(result.winnerBets).toBe(0);
    expect(result.totalBets).toBe(0);
    expect(result.finishedBets).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(0);
    expect(result.exactStreak).toBe(0);
    expect(result.maxExactStreak).toBe(0);
    expect(result.pointsHistory).toEqual([]);
  });

  it('accumulates single bet with 3 points (exact)', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
    ];
    const result = computeStatsFromBets(bets, allFinished);
    expect(result.totalPoints).toBe(3);
    expect(result.exactBets).toBe(1);
    expect(result.winnerBets).toBe(1);
    expect(result.totalBets).toBe(1);
    expect(result.finishedBets).toBe(1);
    expect(result.accuracy).toBeCloseTo(1); // 1 winner / 1 finished bet
    expect(result.currentStreak).toBe(1);
    expect(result.maxStreak).toBe(1);
    expect(result.exactStreak).toBe(1);
    expect(result.maxExactStreak).toBe(1);
  });

  it('accumulates multiple bets with mixed points', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm2', points: 1, isExact: false, isWinner: true },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm3',
        points: 0,
        isExact: false,
        isWinner: false,
      },
    ];
    const result = computeStatsFromBets(bets, allFinished);
    expect(result.totalPoints).toBe(4);
    expect(result.exactBets).toBe(1);
    expect(result.winnerBets).toBe(2);
    expect(result.totalBets).toBe(3);
    expect(result.finishedBets).toBe(3);
    expect(result.accuracy).toBeCloseTo(2 / 3); // 2 winners / 3 finished bets
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(2);
    expect(result.exactStreak).toBe(0);
    expect(result.maxExactStreak).toBe(1);
  });

  it('tracks currentStreak and maxStreak correctly', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm2', points: 1, isExact: false, isWinner: true },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm3',
        points: 0,
        isExact: false,
        isWinner: false,
      },
      { userId: 'u1', predictorId: 'p1', matchId: 'm4', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm5', points: 3, isExact: true, isWinner: true },
    ];
    const result = computeStatsFromBets(bets, allFinished);
    expect(result.currentStreak).toBe(2);
    expect(result.maxStreak).toBe(2);
    expect(result.exactStreak).toBe(2);
    expect(result.maxExactStreak).toBe(2);
  });

  it('caps maxStreak when streak is broken and later exceeded', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm2', points: 3, isExact: true, isWinner: true },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm3',
        points: 0,
        isExact: false,
        isWinner: false,
      },
      { userId: 'u1', predictorId: 'p1', matchId: 'm4', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm5', points: 3, isExact: true, isWinner: true },
      { userId: 'u1', predictorId: 'p1', matchId: 'm6', points: 3, isExact: true, isWinner: true },
    ];
    const result = computeStatsFromBets(bets, allFinished);
    expect(result.currentStreak).toBe(3);
    expect(result.maxStreak).toBe(3);
    expect(result.exactStreak).toBe(3);
    expect(result.maxExactStreak).toBe(3);
  });

  it('populates pointsHistory with only winning bets', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm2',
        points: 0,
        isExact: false,
        isWinner: false,
      },
      { userId: 'u1', predictorId: 'p1', matchId: 'm3', points: 1, isExact: false, isWinner: true },
    ];
    const result = computeStatsFromBets(bets, allFinished);
    expect(result.pointsHistory).toEqual([
      { points: 3, matchId: 'm1' },
      { points: 1, matchId: 'm3' },
    ]);
  });

  it('only counts finished matches for accuracy calculation', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm2',
        points: 0,
        isExact: false,
        isWinner: false,
      },
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm3',
        points: 0,
        isExact: false,
        isWinner: false,
      },
    ];
    const matchStatuses = new Map<string, MockMatchStatus>([
      ['m1', { status: 'finished' }],
      ['m2', { status: 'scheduled' }],
      ['m3', { status: 'finished' }],
    ]);
    // 2 finished bets (m1, m3), 1 winner bet
    const result = computeStatsFromBets(bets, matchStatuses);
    expect(result.totalBets).toBe(3);
    expect(result.finishedBets).toBe(2);
    expect(result.winnerBets).toBe(1);
    expect(result.accuracy).toBeCloseTo(1 / 2); // 1 winner / 2 finished bets
  });

  it('returns 0 accuracy when no matches are finished', () => {
    const bets = [
      {
        userId: 'u1',
        predictorId: 'p1',
        matchId: 'm1',
        points: 0,
        isExact: false,
        isWinner: false,
      },
    ];
    const matchStatuses = new Map<string, MockMatchStatus>([['m1', { status: 'scheduled' }]]);
    const result = computeStatsFromBets(bets, matchStatuses);
    expect(result.finishedBets).toBe(0);
    expect(result.accuracy).toBe(0);
  });
});
