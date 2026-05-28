/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updateGroupStandings } from '../updateGroupStandings';
import { cleanup, fft, mockDb } from './setup';

const wrapped = fft.wrap(updateGroupStandings);

const makeMatchDoc = (
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  groupId = 'A',
) => ({
  id,
  ref: { id },
  data: () => ({
    slug: id,
    phase: 'group',
    groupId,
    homeTeamId,
    awayTeamId,
    result: { home: homeScore, away: awayScore },
    status: 'finished',
    pointsCalculated: true,
  }),
});

const makeMatchData = (overrides: Record<string, any> = {}) => ({
  slug: 'match-1',
  phase: 'group',
  groupId: 'A',
  homeTeamId: 'ARG',
  awayTeamId: 'BRA',
  result: { home: 2, away: 1 },
  status: 'finished',
  pointsCalculated: false,
  ...overrides,
});

let mockStandingsDoc: any;

function runTrigger(matchDocs: any[]) {
  const mockGet = vi.fn().mockResolvedValue({ docs: matchDocs });
  const mockWhere2 = { get: mockGet };
  const mockWhere1 = { where: vi.fn(() => mockWhere2) };
  mockDb.collection.mockImplementation((path: string) => {
    if (path.includes('matches')) {
      return { where: vi.fn(() => mockWhere1) };
    }
    if (path.includes('group_standings')) {
      return { doc: vi.fn(() => mockStandingsDoc) };
    }
    return {} as any;
  });

  const beforeSnap = fft.firestore.makeDocumentSnapshot(
    makeMatchData({ pointsCalculated: false }),
    'tournaments/t1/matches/m1',
  );
  const afterSnap = fft.firestore.makeDocumentSnapshot(
    makeMatchData({ pointsCalculated: true, groupId: 'A' }),
    'tournaments/t1/matches/m1',
  );
  const change = fft.makeChange(beforeSnap, afterSnap);
  return wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
}

describe('updateGroupStandings trigger guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStandingsDoc = { set: vi.fn().mockResolvedValue(undefined) };
    mockDb.collection.mockImplementation((path: string) => {
      if (path.includes('matches')) {
        return {
          where: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ docs: [] }),
          })),
        };
      }
      if (path.includes('group_standings')) {
        return { doc: vi.fn(() => mockStandingsDoc) };
      }
      return {} as any;
    });
  });

  afterAll(() => cleanup());

  it('returns null when before.pointsCalculated is already true (idempotency)', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ pointsCalculated: true }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ pointsCalculated: true }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
  });

  it('returns null when after.phase is knockout (group-only guard)', async () => {
    const beforeSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ phase: 'group', pointsCalculated: false }),
      'tournaments/t1/matches/m1',
    );
    const afterSnap = fft.firestore.makeDocumentSnapshot(
      makeMatchData({ phase: 'knockout', pointsCalculated: true }),
      'tournaments/t1/matches/m1',
    );
    const change = fft.makeChange(beforeSnap, afterSnap);
    const result = await wrapped(change, { params: { tournamentId: 't1', matchId: 'm1' } } as any);
    expect(result).toBeNull();
  });
});

describe('updateGroupStandings tiebreaker — as-built order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStandingsDoc = { set: vi.fn().mockResolvedValue(undefined) };
  });

  afterAll(() => cleanup());

  it('separates teams by points (3 pts per win)', async () => {
    // ARG: 2 wins = 6 pts, BRA: 1 win = 3 pts, MEX: 0 wins = 0 pts
    const matches = [
      makeMatchDoc('m1', 'ARG', 'BRA', 2, 0), // ARG beats BRA
      makeMatchDoc('m2', 'ARG', 'MEX', 2, 0), // ARG beats MEX
      makeMatchDoc('m3', 'BRA', 'MEX', 1, 0), // BRA beats MEX
    ];
    await runTrigger(matches);

    expect(mockStandingsDoc.set).toHaveBeenCalled();
    const setArgs = mockStandingsDoc.set.mock.calls[0][0];
    expect(setArgs.standings[0].teamId).toBe('ARG');
    expect(setArgs.standings[0].points).toBe(6);
    expect(setArgs.standings[1].teamId).toBe('BRA');
    expect(setArgs.standings[1].points).toBe(3);
  });

  it('separates teams by goal difference when points are equal', async () => {
    // ARG and BRA both finish with 3 pts. ARG has GD+1, BRA has GD 0 → ARG rank 1 by GD.
    const matches = [
      makeMatchDoc('m1', 'ARG', 'BRA', 1, 0), // ARG beats BRA → ARG: 3pts GD+1, BRA: 0pts GD-1
      makeMatchDoc('m2', 'BRA', 'MEX', 1, 0), // BRA beats MEX → BRA: 3pts GD0, MEX: 0pts GD-1
    ];
    await runTrigger(matches);

    expect(mockStandingsDoc.set).toHaveBeenCalled();
    const setArgs = mockStandingsDoc.set.mock.calls[0][0];
    expect(setArgs.standings[0].teamId).toBe('ARG');
    expect(setArgs.standings[0].points).toBe(3);
    expect(setArgs.standings[0].goalDifference).toBe(1);
    expect(setArgs.standings[1].teamId).toBe('BRA');
    expect(setArgs.standings[1].points).toBe(3);
    expect(setArgs.standings[1].goalDifference).toBe(0);
  });

  it('breaks tie alphabetically when points, GD, and GF are all equal', async () => {
    // 3-team round-robin with all draws: ARG 0-0 BRA, ARG 0-0 MEX, BRA 0-0 MEX
    // All three teams end up with 2 pts, 0 GD, 0 GF
    // Sort order: ARG (alphabetical first), BRA, MEX
    const matches = [
      makeMatchDoc('m1', 'ARG', 'BRA', 0, 0),
      makeMatchDoc('m2', 'ARG', 'MEX', 0, 0),
      makeMatchDoc('m3', 'BRA', 'MEX', 0, 0),
    ];
    await runTrigger(matches);

    expect(mockStandingsDoc.set).toHaveBeenCalled();
    const setArgs = mockStandingsDoc.set.mock.calls[0][0];
    expect(setArgs.standings[0].teamId).toBe('ARG'); // alphabetical first
    expect(setArgs.standings[0].points).toBe(2);
    expect(setArgs.standings[0].goalDifference).toBe(0);
    expect(setArgs.standings[0].goalsFor).toBe(0);
    expect(setArgs.standings[1].teamId).toBe('BRA');
    expect(setArgs.standings[1].points).toBe(2);
    expect(setArgs.standings[1].goalDifference).toBe(0);
    expect(setArgs.standings[1].goalsFor).toBe(0);
    expect(setArgs.standings[2].teamId).toBe('MEX');
    expect(setArgs.standings[2].points).toBe(2);
  });

  it('3-team accumulation: ARG 2 wins, BRA 1W1L, MEX 2L', async () => {
    // ARG: 6 pts, BRA: 3 pts, MEX: 0 pts
    const matches = [
      makeMatchDoc('m1', 'ARG', 'BRA', 2, 0),
      makeMatchDoc('m2', 'ARG', 'MEX', 2, 0),
      makeMatchDoc('m3', 'BRA', 'MEX', 1, 0),
    ];
    await runTrigger(matches);

    // TODO: H2H tiebreaker not implemented in updateGroupStandings.ts.
    // Current order: Points → GD → GF → teamId (alphabetical).
    // FIFA spec adds H2H pts/GD/GF between tied teams before overall GF.
    // Backfill in a future phase when the function is updated.

    expect(mockStandingsDoc.set).toHaveBeenCalled();
    const setArgs = mockStandingsDoc.set.mock.calls[0][0];
    expect(setArgs.standings[0].teamId).toBe('ARG');
    expect(setArgs.standings[0].points).toBe(6);
    expect(setArgs.standings[1].teamId).toBe('BRA');
    expect(setArgs.standings[1].points).toBe(3);
    expect(setArgs.standings[2].teamId).toBe('MEX');
    expect(setArgs.standings[2].points).toBe(0);
  });
});
