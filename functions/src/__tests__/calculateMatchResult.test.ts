/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateMatchResult, calculatePoints } from '../calculateMatchResult';
import { cleanup, fft, mockBatch, mockDb } from './setup';

const wrapped = fft.wrap(calculateMatchResult);

const makeMatchData = (overrides: Record<string, any> = {}) => ({
  slug: 'match-1',
  phase: 'group',
  groupId: 'A',
  homeTeamId: 'ARG',
  awayTeamId: 'BRA',
  date: { seconds: 1700000000, nanoseconds: 0 },
  stadium: 'Stadium',
  result: { home: null, away: null },
  status: 'scheduled',
  predictionDeadline: { seconds: 1700000000, nanoseconds: 0 },
  pointsCalculated: false,
  createdAt: { seconds: 1700000000, nanoseconds: 0 },
  ...overrides,
});

const makeBetDoc = (id: string, data: Record<string, any> = {}) => ({
  id,
  ref: { id },
  data: () => ({
    userId: 'u1',
    predictorId: 'p1',
    matchId: 'm1',
    homeScore: 1,
    awayScore: 0,
    points: 0,
    isExact: false,
    isWinner: false,
    createdAt: { seconds: 1700000000, nanoseconds: 0 },
    updatedAt: { seconds: 1700000000, nanoseconds: 0 },
    ...data,
  }),
});

describe('calculatePoints kernel', () => {
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

describe('calculateMatchResult trigger guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.collection.mockReturnValue({
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ docs: [] }),
      })),
    } as any);
  });

  afterAll(() => cleanup());

  it('returns null when match was already finished (idempotency)', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished' }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished', result: { home: 2, away: 1 } }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
    expect(mockBatch.update).not.toHaveBeenCalled();
  });

  it('returns null when match is not finished', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'scheduled' }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'scheduled' }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
  });

  it('returns null when result home is null', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'scheduled' }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished', result: { home: null, away: 1 } }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
    expect(mockBatch.update).not.toHaveBeenCalled();
  });

  it('returns null when pointsCalculated is already true', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished', pointsCalculated: false }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished', pointsCalculated: true, result: { home: 2, away: 1 } }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
    expect(mockBatch.update).not.toHaveBeenCalled();
  });

  it('calls batch.update with correct points when match finishes with bets', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'scheduled' }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ status: 'finished', pointsCalculated: false, result: { home: 2, away: 1 } }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);

    const betDoc = makeBetDoc('b1', { homeScore: 2, awayScore: 1 });
    const mockGet = vi.fn().mockResolvedValue({ docs: [betDoc], size: 1 });
    mockDb.collection.mockReturnValue({
      where: vi.fn(() => ({ get: mockGet })),
    } as any);

    await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);

    // bet 2-1 exact match: 3 points, isExact: true, isWinner: true
    expect(mockBatch.update).toHaveBeenCalledWith(
      betDoc.ref,
      expect.objectContaining({ points: 3, isExact: true, isWinner: true }),
    );
    // match doc gets pointsCalculated: true
    const matchDocUpdate = mockBatch.update.mock.calls.find((call) => call[0] === afterSnap.ref);
    expect(matchDocUpdate).toBeDefined();
    expect(matchDocUpdate![1]).toEqual(expect.objectContaining({ pointsCalculated: true }));
  });
});
