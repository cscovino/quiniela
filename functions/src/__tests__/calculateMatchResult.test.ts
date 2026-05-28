import { describe, expect, it } from 'vitest';

import { calculatePoints } from '../calculateMatchResult';

import './setup';

describe('calculatePoints', () => {
  it('awards 3 points for exact score (home win)', () => {
    const result = calculatePoints(2, 1, 2, 1);
    expect(result).toEqual({ points: 3, isExact: true, isWinner: true });
  });

  it('awards 3 points for exact score (away win)', () => {
    const result = calculatePoints(0, 2, 0, 2);
    expect(result).toEqual({ points: 3, isExact: true, isWinner: true });
  });

  it('awards 1 point for correct winner (home team wins)', () => {
    const result = calculatePoints(3, 0, 2, 0);
    expect(result).toEqual({ points: 1, isExact: false, isWinner: true });
  });

  it('awards 1 point for correct winner (away team wins)', () => {
    const result = calculatePoints(0, 2, 0, 3);
    expect(result).toEqual({ points: 1, isExact: false, isWinner: true });
  });

  it('awards 1 point for correct draw', () => {
    const result = calculatePoints(1, 1, 0, 0);
    expect(result).toEqual({ points: 1, isExact: false, isWinner: true });
  });

  it('awards 0 points for wrong outcome', () => {
    const result = calculatePoints(2, 0, 0, 2);
    expect(result).toEqual({ points: 0, isExact: false, isWinner: false });
  });

  it('awards 3 points for draw exact score', () => {
    const result = calculatePoints(0, 0, 0, 0);
    expect(result).toEqual({ points: 3, isExact: true, isWinner: true });
  });

  it('awards 0 points for reverse outcome', () => {
    const result = calculatePoints(1, 0, 0, 1);
    expect(result).toEqual({ points: 0, isExact: false, isWinner: false });
  });
});
