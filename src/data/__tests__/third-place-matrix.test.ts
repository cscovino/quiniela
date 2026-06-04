import { describe, expect, it } from 'vitest';

import {
  type CombinationKey,
  getCombinationKey,
  THIRD_PLACE_MATRIX,
  type ThirdPlaceSlot,
} from '@/data/third-place-matrix';

const SLOT_ORDER: ThirdPlaceSlot[] = [
  'M74',
  'M77',
  'M79',
  'M80',
  'M81',
  'M82',
  'M85',
  'M87',
];

describe('THIRD_PLACE_MATRIX — official FIFA 2026 advancement matrix', () => {
  it('contains exactly 495 combinations (C(12,8))', () => {
    expect(Object.keys(THIRD_PLACE_MATRIX)).toHaveLength(495);
  });

  it('every entry maps all 8 third-place slots to a single group letter', () => {
    for (const [key, row] of Object.entries(THIRD_PLACE_MATRIX)) {
      const values = SLOT_ORDER.map((s) => row[s]);
      expect(values, `key ${key}`).toHaveLength(8);
      for (const v of values) {
        expect(typeof v, `key ${key} slot value`).toBe('string');
        expect(v, `key ${key}`).toMatch(/^[A-L]$/);
      }
    }
  });

  it('every entry assigns each of its 8 groups to exactly one slot', () => {
    for (const [key, row] of Object.entries(THIRD_PLACE_MATRIX)) {
      const assigned = SLOT_ORDER.map((s) => row[s]);
      const keyLetters = key.split('').sort().join('');
      const assignedSorted = [...assigned].sort().join('');
      expect(assignedSorted, `key ${key}`).toBe(keyLetters);
    }
  });

  it('every entry satisfies the official FIFA eligibility constraints', () => {
    const eligibleBySlot: Record<ThirdPlaceSlot, Set<string>> = {
      M74: new Set(['A', 'B', 'C', 'D', 'F']),
      M77: new Set(['C', 'D', 'F', 'G', 'H']),
      M79: new Set(['C', 'E', 'F', 'H', 'I']),
      M80: new Set(['E', 'H', 'I', 'J', 'K']),
      M81: new Set(['B', 'E', 'F', 'I', 'J']),
      M82: new Set(['A', 'E', 'H', 'I', 'J']),
      M85: new Set(['E', 'F', 'G', 'I', 'J']),
      M87: new Set(['D', 'E', 'I', 'J', 'L']),
    };
    for (const [key, row] of Object.entries(THIRD_PLACE_MATRIX)) {
      for (const slot of SLOT_ORDER) {
        const group = row[slot] as string;
        expect(
          eligibleBySlot[slot].has(group),
          `key ${key} slot ${slot} group ${group} not in eligibility set`,
        ).toBe(true);
      }
    }
  });

  it('pinned known combinations match the official FIFA matrix', () => {
    const pinned: Record<CombinationKey, Record<ThirdPlaceSlot, string>> = {
      ABCDEFGH: {
        M74: 'C',
        M77: 'F',
        M79: 'H',
        M80: 'E',
        M81: 'B',
        M82: 'A',
        M85: 'G',
        M87: 'D',
      },
      ABCDFGIL: {
        M74: 'D',
        M77: 'F',
        M79: 'C',
        M80: 'I',
        M81: 'B',
        M82: 'A',
        M85: 'G',
        M87: 'L',
      },
      ABCDEFGK: {
        M74: 'D',
        M77: 'F',
        M79: 'C',
        M80: 'K',
        M81: 'B',
        M82: 'A',
        M85: 'G',
        M87: 'E',
      },
      ACDEFGHI: {
        M74: 'C',
        M77: 'F',
        M79: 'H',
        M80: 'I',
        M81: 'E',
        M82: 'A',
        M85: 'G',
        M87: 'D',
      },
    };
    for (const [key, expected] of Object.entries(pinned)) {
      expect(THIRD_PLACE_MATRIX[key], `key ${key}`).toEqual(expected);
    }
  });

  it('getCombinationKey sorts group letters into canonical order', () => {
    expect(getCombinationKey(['H', 'A', 'C', 'B', 'D', 'E', 'F', 'G'])).toBe(
      'ABCDEFGH',
    );
    expect(getCombinationKey(['L', 'I', 'G', 'F', 'D', 'C', 'B', 'A'])).toBe(
      'ABCDFGIL',
    );
  });
});
