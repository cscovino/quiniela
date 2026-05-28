/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updatePredictorStats } from '../updatePredictorStats';
import { cleanup, fft, mockDb } from './setup';

const wrapped = fft.wrap(updatePredictorStats);

const makeBetDoc = (points = 0, isExact = false, isWinner = false, matchId = 'm1') => ({
  id: `bet-${matchId}`,
  ref: { id: `bet-${matchId}` },
  data: () => ({
    userId: 'u1',
    predictorId: 'p1',
    matchId,
    points,
    isExact,
    isWinner,
    homeScore: 1,
    awayScore: 0,
    createdAt: { seconds: 1700000000, nanoseconds: 0 },
    updatedAt: { seconds: 1700000000, nanoseconds: 0 },
  }),
});

const makeBetData = (overrides: Record<string, any> = {}) => ({
  userId: 'u1',
  predictorId: 'p1',
  matchId: 'm1',
  points: 0,
  isExact: false,
  isWinner: false,
  ...overrides,
});

// Persistent mock objects so we can inspect calls later
let mockStatsSet: any;
let mockAllBetsGet: any;

function setupMocks(bets: any[] = []) {
  mockStatsSet = vi.fn().mockResolvedValue(undefined);
  mockAllBetsGet = vi.fn().mockResolvedValue({ docs: bets });

  const mockStatsDoc = {
    get: vi.fn().mockResolvedValue({ exists: false }),
    set: mockStatsSet,
  };

  mockDb.collection.mockImplementation((path: string) => {
    if (path.includes('bets') && path.includes('tournaments')) {
      return {
        where: vi.fn(() => ({ get: mockAllBetsGet })),
      };
    }
    if (path.includes('users')) {
      return {
        doc: vi.fn(() => mockStatsDoc),
      };
    }
    return {} as any;
  });
}

describe('updatePredictorStats trigger guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks([]);
  });

  afterAll(() => cleanup());

  it('returns null when before.points equals after.points (no change)', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', betId: 'b1' } } as any);
    expect(result).toBeNull();
    expect(mockStatsSet).not.toHaveBeenCalled();
  });
});

describe('updatePredictorStats stats accumulation', () => {
  afterAll(() => cleanup());

  it('accumulates single bet with 3 points (exact)', async () => {
    vi.clearAllMocks();
    const bets = [makeBetDoc(3, true, true, 'm1')];
    setupMocks(bets);

    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 3 }),
      'tournaments/t1/bets/b1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    await wrapped(change, { params: { tournamentId: 't1', betId: 'b1' } } as any);

    expect(mockStatsSet).toHaveBeenCalledTimes(1);
    const setArgs = mockStatsSet.mock.calls[0][0];
    expect(setArgs.totalPoints).toBe(3);
    expect(setArgs.exactBets).toBe(1);
    expect(setArgs.winnerBets).toBe(1);
    expect(setArgs.totalBets).toBe(1);
  });

  it('accumulates multiple bets with mixed points', async () => {
    vi.clearAllMocks();
    const bets = [
      makeBetDoc(3, true, true, 'm1'),
      makeBetDoc(1, false, true, 'm2'),
      makeBetDoc(0, false, false, 'm3'),
    ];
    setupMocks(bets);

    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 3 }),
      'tournaments/t1/bets/b1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    await wrapped(change, { params: { tournamentId: 't1', betId: 'b1' } } as any);

    expect(mockStatsSet).toHaveBeenCalledTimes(1);
    const setArgs = mockStatsSet.mock.calls[0][0];
    expect(setArgs.totalPoints).toBe(4); // 3 + 1 + 0
    expect(setArgs.totalBets).toBe(3);
    expect(setArgs.exactBets).toBe(1);
    expect(setArgs.winnerBets).toBe(2);
  });

  it('tracks currentStreak and maxStreak correctly', async () => {
    vi.clearAllMocks();
    const bets = [
      makeBetDoc(1, false, true, 'm1'),
      makeBetDoc(2, false, true, 'm2'),
      makeBetDoc(0, false, false, 'm3'),
      makeBetDoc(3, true, true, 'm4'),
    ];
    setupMocks(bets);

    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 1 }),
      'tournaments/t1/bets/b1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    await wrapped(change, { params: { tournamentId: 't1', betId: 'b1' } } as any);

    expect(mockStatsSet).toHaveBeenCalledTimes(1);
    const setArgs = mockStatsSet.mock.calls[0][0];
    // m1: streak=1, max=1
    // m2: streak=2, max=2
    // m3: streak=0, max=2
    // m4: streak=1, max=2 (ends at 1, max was 2)
    expect(setArgs.currentStreak).toBe(1);
    expect(setArgs.maxStreak).toBe(2);
  });
});

describe('updatePredictorStats — SEC-06 Timestamp regression lock (TEST-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks([]);
  });

  afterAll(() => cleanup());

  it('pointsHistory entries have a timestamp with .seconds and .nanoseconds (not a Date)', async () => {
    const bets = [makeBetDoc(2, false, true, 'm1')];
    setupMocks(bets);

    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 0 }),
      'tournaments/t1/bets/b1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeBetData({ points: 2 }),
      'tournaments/t1/bets/b1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    await wrapped(change, { params: { tournamentId: 't1', betId: 'b1' } } as any);

    expect(mockStatsSet).toHaveBeenCalledTimes(1);
    const setArgs = mockStatsSet.mock.calls[0][0];

    // SEC-06 regression lock: admin.firestore.Timestamp.now() (not new Date() or FieldValue.serverTimestamp())
    // must be used inside pointsHistory push. Reverting to new Date() would cause this assertion to fail
    // because Date objects lack .nanoseconds.
    expect(setArgs.pointsHistory).toHaveLength(1);
    expect(setArgs.pointsHistory[0].timestamp).toMatchObject({
      seconds: expect.any(Number),
      nanoseconds: expect.any(Number),
    });
  });
});
