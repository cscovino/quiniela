import { describe, expect, it } from 'vitest';

import { scoreGroupBet } from '../calculateGroupResults';

import './setup';

describe('scoreGroupBet', () => {
  const standings = [
    {
      teamId: 'ARG',
      position: 1,
      played: 3,
      won: 3,
      drawn: 0,
      lost: 0,
      goalsFor: 7,
      goalsAgainst: 1,
      goalDifference: 6,
      points: 9,
    },
    {
      teamId: 'BRA',
      position: 2,
      played: 3,
      won: 2,
      drawn: 0,
      lost: 1,
      goalsFor: 5,
      goalsAgainst: 3,
      goalDifference: 2,
      points: 6,
    },
    {
      teamId: 'MEX',
      position: 3,
      played: 3,
      won: 1,
      drawn: 0,
      lost: 2,
      goalsFor: 3,
      goalsAgainst: 4,
      goalDifference: -1,
      points: 3,
    },
    {
      teamId: 'CHI',
      position: 4,
      played: 3,
      won: 0,
      drawn: 0,
      lost: 3,
      goalsFor: 1,
      goalsAgainst: 8,
      goalDifference: -7,
      points: 0,
    },
  ];

  it('awards 12 points for exact prediction of all 4 positions', () => {
    const positions = ['ARG', 'BRA', 'MEX', 'CHI'];
    const result = scoreGroupBet(positions, standings);
    expect(result).toEqual({ points: 12, exactMatches: 4, wrongPositionMatches: 0 });
  });

  it('awards 8 points for mixed exact and wrong-position (ARG exact, MEX/BRA swapped, CHI exact)', () => {
    const positions = ['ARG', 'MEX', 'BRA', 'CHI'];
    const result = scoreGroupBet(positions, standings);
    expect(result).toEqual({ points: 8, exactMatches: 2, wrongPositionMatches: 2 });
  });

  it('awards 0 points for completely wrong prediction', () => {
    const positions = ['USA', 'ENG', 'GER', 'FRA'];
    const result = scoreGroupBet(positions, standings);
    expect(result).toEqual({ points: 0, exactMatches: 0, wrongPositionMatches: 0 });
  });

  it('awards 8 points when swapped teams qualify (BRA/ARG swap)', () => {
    const positions = ['BRA', 'ARG', 'MEX', 'CHI'];
    const result = scoreGroupBet(positions, standings);
    expect(result).toEqual({ points: 8, exactMatches: 2, wrongPositionMatches: 2 });
  });

  it('handles empty positions array', () => {
    const result = scoreGroupBet([], standings);
    expect(result).toEqual({ points: 0, exactMatches: 0, wrongPositionMatches: 0 });
  });

  it('handles empty standings array', () => {
    const positions = ['ARG', 'BRA', 'MEX', 'CHI'];
    const result = scoreGroupBet(positions, []);
    expect(result).toEqual({ points: 0, exactMatches: 0, wrongPositionMatches: 0 });
  });
});
