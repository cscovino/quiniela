import { describe, expect, it } from 'vitest';

import { bucketByLocalDay } from '../points-history';

const june12 = new Date('2026-06-12T10:00:00');
const june12b = new Date('2026-06-12T22:30:00');
const june15 = new Date('2026-06-15T14:00:00');

describe('bucketByLocalDay', () => {
  it('returns an empty map for empty input', () => {
    const result = bucketByLocalDay([]);
    expect(result.size).toBe(0);
  });

  describe('same-day merging', () => {
    it('sums multiple events on the same local day', () => {
      const result = bucketByLocalDay([
        { date: june12, points: 5 },
        { date: june12b, points: 3 },
      ]);
      expect(result.size).toBe(1);
      expect(result.get('2026-06-12')).toBe(8);
    });

    it('keeps separate buckets for different days', () => {
      const result = bucketByLocalDay([
        { date: june12, points: 5 },
        { date: june12b, points: 3 },
        { date: june15, points: 7 },
      ]);
      expect(result.size).toBe(2);
      expect(result.get('2026-06-12')).toBe(8);
      expect(result.get('2026-06-15')).toBe(7);
    });
  });

  describe('zero-point entries', () => {
    it('still buckets an entry with zero points', () => {
      const result = bucketByLocalDay([{ date: june12, points: 0 }]);
      expect(result.size).toBe(1);
      expect(result.get('2026-06-12')).toBe(0);
    });
  });

  describe('multi-day separation', () => {
    it('produces one key per distinct local day', () => {
      const result = bucketByLocalDay([
        { date: june12, points: 5 },
        { date: june15, points: 7 },
      ]);
      expect(result.size).toBe(2);
      expect(result.get('2026-06-12')).toBe(5);
      expect(result.get('2026-06-15')).toBe(7);
    });
  });
});
