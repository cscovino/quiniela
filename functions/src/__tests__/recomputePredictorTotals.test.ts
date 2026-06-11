import { beforeEach, describe, expect, it, vi } from 'vitest';

// Self-contained firebase-admin mock (does NOT import ./setup) so we can feed
// per-collection bet data and inspect what gets written to the stats doc.
const h = vi.hoisted(() => {
  const setMock = vi.fn().mockResolvedValue(undefined);
  const state: { betData: Record<string, Array<Record<string, unknown>>> } = { betData: {} };
  const db = {
    collection: (path: string) => {
      if (path.includes('/stats')) {
        return { doc: () => ({ set: setMock, get: vi.fn() }) };
      }
      const collection = path.split('/')[2];
      return {
        where: () => ({
          get: () =>
            Promise.resolve({
              docs: (state.betData[collection] ?? []).map((d) => ({ data: () => d })),
            }),
        }),
      };
    },
  };
  return { setMock, state, db };
});

vi.mock('firebase-admin', () => ({
  __esModule: true,
  firestore: Object.assign(() => h.db, { FieldValue: { serverTimestamp: () => 'TS' } }),
}));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'TS' },
}));

import {
  recomputePredictorTotals,
  sumField,
  sumPoints,
  totalFromSubtotals,
} from '../recomputePredictorTotals';

describe('sumPoints', () => {
  it('sums numeric points', () => {
    expect(sumPoints([{ points: 3 }, { points: 1 }, { points: 0 }])).toBe(4);
  });

  it('treats missing/null/non-numeric points as 0', () => {
    expect(sumPoints([{ points: 3 }, {}, { points: null }, { points: undefined }])).toBe(3);
  });

  it('returns 0 for empty', () => {
    expect(sumPoints([])).toBe(0);
  });
});

describe('sumField', () => {
  it('sums an arbitrary numeric field', () => {
    expect(sumField([{ exactQualified: 2 }, { exactQualified: 4 }, {}], 'exactQualified')).toBe(6);
  });
});

describe('totalFromSubtotals', () => {
  it('adds all five category subtotals', () => {
    expect(
      totalFromSubtotals({
        matchPoints: 3,
        groupPoints: 1,
        knockoutPoints: 1,
        finalFourPoints: 5,
        bestPlayerPoints: 5,
      }),
    ).toBe(15);
  });
});

describe('recomputePredictorTotals', () => {
  beforeEach(() => {
    h.setMock.mockClear();
    h.state.betData = {};
  });

  it('writes an ABSOLUTE totalPoints derived from all bet collections (no increment)', async () => {
    h.state.betData = {
      bets: [
        { points: 3, predictorId: 'p1' },
        { points: 0, predictorId: 'p1' },
      ],
      group_bets: [{ points: 1, exactQualified: 2, predictorId: 'p1' }],
      knockout_bets: [{ points: 1, predictorId: 'p1' }],
      final_phase_bets: [{ points: 5, predictorId: 'p1' }],
      best_players_bets: [{ points: 5, predictorId: 'p1' }],
    };

    const result = await recomputePredictorTotals('u1', 'p1', 't1');

    expect(result).toEqual({
      matchPoints: 3,
      groupPoints: 1,
      knockoutPoints: 1,
      finalFourPoints: 5,
      bestPlayerPoints: 5,
      totalPoints: 15,
      groupQualified: 2,
    });

    expect(h.setMock).toHaveBeenCalledTimes(1);
    const [payload, options] = h.setMock.mock.calls[0];
    expect(payload.totalPoints).toBe(15); // a plain number, not a FieldValue.increment
    expect(typeof payload.totalPoints).toBe('number');
    expect(payload.matchPoints).toBe(3);
    expect(payload.groupQualified).toBe(2);
    expect(options).toEqual({ merge: true });
  });

  it('is idempotent: repeated runs converge to the same total (this is the bug fix)', async () => {
    h.state.betData = {
      bets: [{ points: 3, predictorId: 'p1' }],
    };

    const first = await recomputePredictorTotals('u1', 'p1', 't1');
    const second = await recomputePredictorTotals('u1', 'p1', 't1');
    const third = await recomputePredictorTotals('u1', 'p1', 't1');

    expect(first.totalPoints).toBe(3);
    expect(second.totalPoints).toBe(3);
    expect(third.totalPoints).toBe(3);

    // Every write set the same absolute value — an increment model would have
    // produced 3, then 6, then 9 (exactly the reported 7/9 drift).
    for (const call of h.setMock.mock.calls) {
      expect(call[0].totalPoints).toBe(3);
    }
  });

  it('returns zeros when a predictor has no scored bets', async () => {
    const result = await recomputePredictorTotals('u1', 'p1', 't1');
    expect(result.totalPoints).toBe(0);
    expect(result.matchPoints).toBe(0);
    expect(result.groupQualified).toBe(0);
  });
});
