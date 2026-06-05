import { describe, expect, it } from 'vitest';

import { scoreKnockoutBet } from '../calculateKnockoutResults';

describe('scoreKnockoutBet', () => {
  it('awards 1 point for correct winner (home team)', () => {
    const result = scoreKnockoutBet('ARG', 'ARG', 'BRA', { home: 2, away: 1 });
    expect(result.points).toBe(1);
  });

  it('awards 1 point for correct winner (away team)', () => {
    const result = scoreKnockoutBet('BRA', 'ARG', 'BRA', { home: 0, away: 1 });
    expect(result.points).toBe(1);
  });

  it('awards 0 points for wrong winner', () => {
    const result = scoreKnockoutBet('ARG', 'ARG', 'BRA', { home: 0, away: 1 });
    expect(result.points).toBe(0);
  });

  it('treats draw as no winner (returns 0)', () => {
    const result = scoreKnockoutBet('ARG', 'ARG', 'BRA', { home: 1, away: 1 });
    expect(result.points).toBe(0);
  });

  it('is case-insensitive (uppercase predicted vs uppercase actual)', () => {
    const result = scoreKnockoutBet('arg', 'ARG', 'BRA', { home: 2, away: 0 });
    expect(result.points).toBe(1);
  });

  it('is case-insensitive (lowercase actual still works)', () => {
    const result = scoreKnockoutBet('ARG', 'arg', 'BRA', { home: 2, away: 0 });
    expect(result.points).toBe(1);
  });

  it('returns 0 when result is null', () => {
    const result = scoreKnockoutBet('ARG', 'ARG', 'BRA', { home: null, away: 1 });
    expect(result.points).toBe(0);
  });

  it('returns 0 when homeTeamId is null', () => {
    const result = scoreKnockoutBet('ARG', null, 'BRA', { home: 2, away: 1 });
    expect(result.points).toBe(0);
  });
});
