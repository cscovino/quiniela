import { describe, expect, it } from 'vitest';

import { formatKnockoutSlot } from '../knockout-slot';

describe('formatKnockoutSlot', () => {
  describe('en', () => {
    it('formats single group leaders', () => {
      expect(formatKnockoutSlot('1A', 'en')).toBe('1st Group A');
      expect(formatKnockoutSlot('2B', 'en')).toBe('2nd Group B');
      expect(formatKnockoutSlot('3L', 'en')).toBe('3rd Group L');
    });

    it('formats third-placed teams from a group set', () => {
      expect(formatKnockoutSlot('3C/D/E', 'en')).toBe('3rd C/D/E');
      expect(formatKnockoutSlot('3I/J/L', 'en')).toBe('3rd I/J/L');
    });

    it('formats winner-of and loser-of slots', () => {
      expect(formatKnockoutSlot('W-R32-1', 'en')).toBe('Winner R32-1');
      expect(formatKnockoutSlot('W-QF-3', 'en')).toBe('Winner QF-3');
      expect(formatKnockoutSlot('W-SF-1', 'en')).toBe('Winner SF-1');
      expect(formatKnockoutSlot('L-SF-2', 'en')).toBe('Loser SF-2');
    });
  });

  describe('es', () => {
    it('formats group leaders and third-placed teams', () => {
      expect(formatKnockoutSlot('1A', 'es')).toBe('1º Grupo A');
      expect(formatKnockoutSlot('3C/D/E', 'es')).toBe('3º C/D/E');
    });

    it('formats winner-of and loser-of slots', () => {
      expect(formatKnockoutSlot('W-R32-1', 'es')).toBe('Ganador R32-1');
      expect(formatKnockoutSlot('L-SF-1', 'es')).toBe('Perdedor SF-1');
    });
  });

  it('defaults to en when locale is omitted', () => {
    expect(formatKnockoutSlot('W-R32-1')).toBe('Winner R32-1');
  });

  it('returns unknown codes verbatim and empty for missing input', () => {
    expect(formatKnockoutSlot('SOMETHING-ELSE', 'en')).toBe('SOMETHING-ELSE');
    expect(formatKnockoutSlot('', 'en')).toBe('');
    expect(formatKnockoutSlot(undefined, 'en')).toBe('');
  });
});
