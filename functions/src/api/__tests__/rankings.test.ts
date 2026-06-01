import { describe, expect, it } from 'vitest';

import { buildRankingEntries } from '../rankings';

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
        },
      ],
    ]);
    const [entry] = buildRankingEntries([sampleStat('u1', 'p1')], profileMap);
    expect(entry).toHaveProperty('avatar');
    expect(entry).toHaveProperty('avatarUrl');
  });
});
