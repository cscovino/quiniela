/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAndAwardBadges } from '../checkAndAwardBadges';
import { cleanup, fft, mockDb } from './setup';

const wrapped = fft.wrap(checkAndAwardBadges);

const makeStats = (overrides: Record<string, any> = {}) => ({
  predictorId: 'p1',
  tournamentId: 't1',
  totalPoints: 0,
  exactBets: 0,
  winnerBets: 0,
  totalBets: 0,
  accuracy: 0,
  currentStreak: 0,
  maxStreak: 0,
  pointsHistory: [],
  badgesAwarded: {},
  lastUpdated: { seconds: 1700000000, nanoseconds: 0 },
  ...overrides,
});

let mockRefUpdate: any;
let mockNotificationBatchSet: any;

function setupBadgeMocks() {
  mockRefUpdate = vi.fn().mockResolvedValue(undefined);
  mockNotificationBatchSet = vi.fn().mockResolvedValue(undefined);

  const mockBatchInstance = {
    set: mockNotificationBatchSet,
    commit: vi.fn().mockResolvedValue(undefined),
  };

  mockDb.batch.mockReturnValue(mockBatchInstance);
  mockDb.collection.mockReturnValue({
    doc: vi.fn(() => ({ set: vi.fn().mockResolvedValue(undefined) })),
  } as any);
}

// Helper to create a change object with a custom after.ref
function makeChangeWithMockRef(beforeData: any, afterData: any, mockRef: any) {
  const beforeSnap = fft.firestore.makeDocumentSnapshot(
    beforeData,
    'users/u1/predictors/p1/stats/t1',
  );
  const afterSnap = fft.firestore.makeDocumentSnapshot(
    afterData,
    'users/u1/predictors/p1/stats/t1',
  );
  const change = fft.makeChange(beforeSnap, afterSnap) as any;
  // Override change.after with a plain object that has our mock ref
  Object.defineProperty(change, 'after', {
    value: {
      ref: mockRef,
      data: () => afterData,
    },
  });
  return change;
}

describe('checkAndAwardBadges — no badges awarded', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBadgeMocks();
  });

  afterAll(() => cleanup());

  it('returns null when no badge conditions are met', async () => {
    const before = makeStats({ totalBets: 0, currentStreak: 0, winnerBets: 0, exactBets: 0 });
    const after = makeStats({ totalBets: 0, currentStreak: 0, winnerBets: 0, exactBets: 0 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    const result = await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);
    expect(result).toBeNull();
    expect(mockRefUpdate).not.toHaveBeenCalled();
    expect(mockNotificationBatchSet).not.toHaveBeenCalled();
  });
});

describe('checkAndAwardBadges — individual badge conditions (TEST-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBadgeMocks();
  });

  afterAll(() => cleanup());

  it('awards first-blood when totalBets >= 1', async () => {
    const before = makeStats({ totalBets: 0 });
    const after = makeStats({ totalBets: 1 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('first-blood');
    expect(typeof updateArgs.badgesAwarded['first-blood']).toBe('string');
    expect(updateArgs.badgesAwarded['first-blood']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('awards on-fire when currentStreak >= 3', async () => {
    const before = makeStats({ currentStreak: 2 });
    const after = makeStats({ currentStreak: 3 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('on-fire');
  });

  it('awards consistent when winnerBets >= 10', async () => {
    const before = makeStats({ winnerBets: 9 });
    const after = makeStats({ winnerBets: 10 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('consistent');
  });

  it('awards perfect-group when exactBets >= 6', async () => {
    const before = makeStats({ exactBets: 5 });
    const after = makeStats({ exactBets: 6 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('perfect-group');
  });
});

describe('checkAndAwardBadges — idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBadgeMocks();
  });

  afterAll(() => cleanup());

  it('does not re-award already-awarded badge', async () => {
    const before = makeStats({
      totalBets: 1,
      badgesAwarded: { 'first-blood': '2026-01-01T00:00:00.000Z' },
    });
    const after = makeStats({
      totalBets: 5,
      badgesAwarded: { 'first-blood': '2026-01-01T00:00:00.000Z' },
    });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    // No new badges awarded (first-blood already awarded, no other conditions met)
    expect(mockRefUpdate).not.toHaveBeenCalled();
  });

  it('awards badge when condition newly met but other badges were already awarded', async () => {
    const before = makeStats({
      totalBets: 1,
      currentStreak: 2,
      badgesAwarded: { 'first-blood': '2026-01-01T00:00:00.000Z' },
    });
    const after = makeStats({
      totalBets: 2,
      currentStreak: 3,
      badgesAwarded: { 'first-blood': '2026-01-01T00:00:00.000Z' },
    });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('first-blood');
    expect(updateArgs.badgesAwarded).toHaveProperty('on-fire');
    expect(Object.keys(updateArgs.badgesAwarded)).toHaveLength(2);
  });
});

describe('checkAndAwardBadges — multi-badge + notification batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBadgeMocks();
  });

  afterAll(() => cleanup());

  it('awards all four badges simultaneously and creates notification for each', async () => {
    const before = makeStats({ totalBets: 0, currentStreak: 0, winnerBets: 0, exactBets: 0 });
    const after = makeStats({ totalBets: 1, currentStreak: 3, winnerBets: 10, exactBets: 6 });
    const change = makeChangeWithMockRef(before, after, { update: mockRefUpdate });

    await wrapped(change, {
      params: { userId: 'u1', predictorId: 'p1', tournamentId: 't1' },
    } as any);

    expect(mockRefUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockRefUpdate.mock.calls[0][0];
    expect(updateArgs.badgesAwarded).toHaveProperty('first-blood');
    expect(updateArgs.badgesAwarded).toHaveProperty('on-fire');
    expect(updateArgs.badgesAwarded).toHaveProperty('consistent');
    expect(updateArgs.badgesAwarded).toHaveProperty('perfect-group');
    expect(Object.keys(updateArgs.badgesAwarded)).toHaveLength(4);

    // Notification batch should be created for all 4 new badges
    expect(mockDb.batch).toHaveBeenCalled();
  });
});
