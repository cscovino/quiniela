import { describe, expect, it } from 'vitest';

import { BADGE_DEFINITIONS } from '@app-types/badges';

import { SCORING } from '@/config/scoring';

describe('RulesPage data integrity', () => {
  it('SCORING constants match documented values in rules page', () => {
    // Match scoring
    expect(SCORING.MATCH.EXACT).toBe(3);
    expect(SCORING.MATCH.WINNER).toBe(1);
    expect(SCORING.MATCH.DRAW).toBe(1);
    expect(SCORING.MATCH.WRONG).toBe(0);
    // Group scoring
    expect(SCORING.GROUP.EXACT_POSITION).toBe(3);
    expect(SCORING.GROUP.QUALIFIED).toBe(1);
    // Final Four
    expect(SCORING.FINAL_FOUR.EXACT_POSITION).toBe(5);
    expect(SCORING.FINAL_FOUR.QUALIFIED).toBe(3);
    // Best Player
    expect(SCORING.BEST_PLAYER.CORRECT).toBe(5);
  });

  it('BADGE_DEFINITIONS has exactly 6 badges', () => {
    expect(BADGE_DEFINITIONS).toHaveLength(6);
  });

  it('each badge has required fields for rules page display', () => {
    const requiredFields = ['id', 'name', 'description', 'icon', 'condition'];
    for (const badge of BADGE_DEFINITIONS) {
      for (const field of requiredFields) {
        expect(badge).toHaveProperty(field);
      }
      // name and condition must have en and es
      expect(badge.name).toHaveProperty('en');
      expect(badge.name).toHaveProperty('es');
      expect(badge.condition).toHaveProperty('en');
      expect(badge.condition).toHaveProperty('es');
    }
  });

  it('all 6 expected badge IDs are present', () => {
    const expectedIds = [
      'first-blood',
      'on-fire',
      'consistent',
      'top-10',
      'perfect-group',
      'clairvoyant',
    ];
    const actualIds = BADGE_DEFINITIONS.map((b) => b.id);
    expect(actualIds).toEqual(expect.arrayContaining(expectedIds));
    expect(actualIds).toHaveLength(expectedIds.length);
  });
});
