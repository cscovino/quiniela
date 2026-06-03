import { describe, expect, it } from 'vitest';

import { getBadgeAwards } from '../checkAndAwardBadges';

import './setup';

interface TimestampLike {
  seconds: number;
  nanoseconds: number;
}

describe('getBadgeAwards', () => {
  it('returns empty object when no badges earned', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 0,
      exactBets: 0,
      winnerBets: 0,
      totalBets: 0,
      accuracy: 0,
      currentStreak: 0,
      maxStreak: 0,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards({}, stats);
    expect(result).toEqual({});
  });

  it('awards first-blood when totalBets >= 1', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 3,
      exactBets: 1,
      winnerBets: 1,
      totalBets: 1,
      accuracy: 1,
      currentStreak: 1,
      maxStreak: 1,
      pointsHistory: [{ timestamp: { seconds: 0, nanoseconds: 0 }, points: 3, matchId: 'm1' }],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards({}, stats);
    expect(result['first-blood']).toBeDefined();
  });

  it('awards on-fire when currentStreak >= 3', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 9,
      exactBets: 3,
      winnerBets: 3,
      totalBets: 3,
      accuracy: 1,
      currentStreak: 3,
      maxStreak: 3,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards({}, stats);
    expect(result['on-fire']).toBeDefined();
  });

  it('awards consistent when winnerBets >= 20', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 30,
      exactBets: 10,
      winnerBets: 20,
      totalBets: 24,
      accuracy: 10 / 24,
      currentStreak: 2,
      maxStreak: 4,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards({}, stats);
    expect(result['consistent']).toBeDefined();
  });

  it('awards perfect-group when groupQualified >= 16', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 48,
      exactBets: 16,
      winnerBets: 16,
      totalBets: 16,
      accuracy: 1,
      currentStreak: 16,
      maxStreak: 16,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
      groupQualified: 16,
    };
    const result = getBadgeAwards({}, stats);
    expect(result['perfect-group']).toBeDefined();
  });

  it('does not re-award already awarded badge', () => {
    const existingBadges = { 'first-blood': '2024-01-01T00:00:00.000Z' };
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 6,
      exactBets: 2,
      winnerBets: 2,
      totalBets: 2,
      accuracy: 1,
      currentStreak: 2,
      maxStreak: 2,
      pointsHistory: [],
      badgesAwarded: existingBadges,
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards(existingBadges, stats);
    expect(result['first-blood']).toBe('2024-01-01T00:00:00.000Z');
    expect(Object.keys(result).length).toBe(1);
  });

  it('awards multiple badges simultaneously', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 48,
      exactBets: 1,
      winnerBets: 20,
      totalBets: 48,
      accuracy: 1,
      currentStreak: 48,
      maxStreak: 48,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
      groupQualified: 16,
    };
    const result = getBadgeAwards({}, stats);
    expect(result['first-blood']).toBeDefined();
    expect(result['on-fire']).toBeDefined();
    expect(result['perfect-group']).toBeDefined();
    expect(result['consistent']).toBeDefined();
  });

  it('awards badge when condition newly met but other badges were already awarded', () => {
    const existingBadges = { 'first-blood': '2024-01-01T00:00:00.000Z' };
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 9,
      exactBets: 3,
      winnerBets: 3,
      totalBets: 3,
      accuracy: 1,
      currentStreak: 3,
      maxStreak: 3,
      pointsHistory: [],
      badgesAwarded: existingBadges,
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards(existingBadges, stats);
    expect(result['first-blood']).toBe('2024-01-01T00:00:00.000Z');
    expect(result['on-fire']).toBeDefined();
  });

  it('handles null/undefined existing badges', () => {
    const stats = {
      predictorId: 'p1',
      tournamentId: 't1',
      totalPoints: 3,
      exactBets: 1,
      winnerBets: 1,
      totalBets: 1,
      accuracy: 1,
      currentStreak: 1,
      maxStreak: 1,
      pointsHistory: [],
      badgesAwarded: {},
      lastUpdated: { seconds: 0, nanoseconds: 0 } as TimestampLike,
    };
    const result = getBadgeAwards({} as Record<string, string>, stats);
    expect(result['first-blood']).toBeDefined();
  });
});
