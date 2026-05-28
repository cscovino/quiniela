import { describe, expect, it } from 'vitest';

import { computeStatsFromBets } from '../updatePredictorStats';

import './setup';

describe('computeStatsFromBets', () => {
  it('returns zeros for empty bets array', () => {
    const result = computeStatsFromBets([]);
    expect(result.totalPoints).toBe(0);
    expect(result.exactBets).toBe(0);
    expect(result.winnerBets).toBe(0);
    expect(result.totalBets).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(0);
    expect(result.pointsHistory).toEqual([]);
  });

  it('accumulates single bet with 3 points (exact)', () => {
    const bets = [
      { userId: 'u1', predictorId: 'p1', matchId: 'm1', points: 3, isExact: true, isWinner: true },
    ];
    const result = computeStatsFromBets(bets);
    expect(result.totalPoints).toBe(3);
    expect(result.exactBets).toBe(1);
    expect(result.winnerBets).toBe(1);
    expect(result.totalBets).toBe(1);
    expect(result.accuracy).toBe(1);
    expect(result.currentStreak).toBe(1);
    expect(result.maxStreak).toBe(1);
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
    const result = computeStatsFromBets(bets);
    expect(result.totalPoints).toBe(4);
    expect(result.exactBets).toBe(1);
    expect(result.winnerBets).toBe(2);
    expect(result.totalBets).toBe(3);
    expect(result.accuracy).toBeCloseTo(2 / 3);
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(2);
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
      { userId: 'u1', predictorId: 'p1', matchId: 'm5', points: 1, isExact: false, isWinner: true },
    ];
    const result = computeStatsFromBets(bets);
    expect(result.currentStreak).toBe(2);
    expect(result.maxStreak).toBe(2);
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
    const result = computeStatsFromBets(bets);
    expect(result.currentStreak).toBe(3);
    expect(result.maxStreak).toBe(3);
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
    const result = computeStatsFromBets(bets);
    expect(result.pointsHistory).toEqual([
      { points: 3, matchId: 'm1' },
      { points: 1, matchId: 'm3' },
    ]);
  });
});
