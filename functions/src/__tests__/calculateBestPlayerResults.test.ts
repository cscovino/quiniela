import { describe, expect, it } from 'vitest';

import { fuzzyMatch, normalizeName } from '../calculateBestPlayerResults';

import './setup';

describe('normalizeName', () => {
  it('lowercases and trims the input', () => {
    expect(normalizeName('  Lamine Yamal  ')).toBe('lamine yamal');
  });

  it('strips diacritics from accented characters', () => {
    expect(normalizeName('Kylian Mbappé')).toBe('kylian mbappe');
  });

  it('strips diacritics from Spanish names', () => {
    expect(normalizeName('Emiliano Martínez')).toBe('emiliano martinez');
  });

  it('strips non-alphanumeric characters (except spaces)', () => {
    expect(normalizeName('Pelé (o Rei)')).toBe('pele o rei');
  });
});

describe('fuzzyMatch', () => {
  it('returns true for exact match', () => {
    expect(fuzzyMatch('Kylian Mbappé', 'Kylian Mbappé')).toBe(true);
  });

  it('returns true when diacritics differ (Mbappé vs Mbappe)', () => {
    expect(fuzzyMatch('Mbappé', 'Mbappe')).toBe(true);
  });

  it('returns true with contains match (predicted contains actual)', () => {
    expect(fuzzyMatch('Mbappé', 'Kylian Mbappé')).toBe(true);
  });

  it('returns true with contains match (actual contains predicted)', () => {
    expect(fuzzyMatch('Kylian Mbappé', 'Mbappé')).toBe(true);
  });

  it('returns true with surname fallback (last word matches, length > 2)', () => {
    expect(fuzzyMatch('Mbappe', 'Kylian Mbappé')).toBe(true);
  });

  it('returns false for completely wrong prediction', () => {
    expect(fuzzyMatch('Ronaldo', 'Kylian Mbappé')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(fuzzyMatch('mbappe', 'MBAPPE')).toBe(true);
  });

  it('returns false when predicted is empty', () => {
    expect(fuzzyMatch('', 'Kylian Mbappé')).toBe(false);
  });

  it('returns false when actual is empty', () => {
    expect(fuzzyMatch('Kylian Mbappé', '')).toBe(false);
  });

  it('handles short surname (length <= 2, no surname fallback)', () => {
    // "Bob Ji" vs "Alan Ji" — surname "ji" is length 2, should not match via fallback
    expect(fuzzyMatch('Bob Ji', 'Alan Ji')).toBe(false);
  });
});

describe('scoring calculation', () => {
  it('awards 10 points when both topScorer and bestGoalkeeper match', () => {
    const scoreTopScorer = fuzzyMatch('Kylian Mbappé', 'Kylian Mbappé');
    const scoreGoalkeeper = fuzzyMatch('Emiliano Martínez', 'Emiliano Martínez');
    const points = (scoreTopScorer ? 5 : 0) + (scoreGoalkeeper ? 5 : 0);
    expect(points).toBe(10);
  });

  it('awards 5 points when only topScorer matches', () => {
    const scoreTopScorer = fuzzyMatch('Kylian Mbappé', 'Kylian Mbappé');
    const scoreGoalkeeper = fuzzyMatch('Ronaldo', 'Emiliano Martínez');
    const points = (scoreTopScorer ? 5 : 0) + (scoreGoalkeeper ? 5 : 0);
    expect(points).toBe(5);
  });

  it('awards 5 points when only bestGoalkeeper matches', () => {
    const scoreTopScorer = fuzzyMatch('Ronaldo', 'Kylian Mbappé');
    const scoreGoalkeeper = fuzzyMatch('Emiliano Martínez', 'Emiliano Martínez');
    const points = (scoreTopScorer ? 5 : 0) + (scoreGoalkeeper ? 5 : 0);
    expect(points).toBe(5);
  });

  it('awards 0 points when neither matches', () => {
    const scoreTopScorer = fuzzyMatch('Ronaldo', 'Kylian Mbappé');
    const scoreGoalkeeper = fuzzyMatch('Messi', 'Emiliano Martínez');
    const points = (scoreTopScorer ? 5 : 0) + (scoreGoalkeeper ? 5 : 0);
    expect(points).toBe(0);
  });
});
