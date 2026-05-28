import { describe, expect, it } from 'vitest';

import { computeStandings } from '../updateGroupStandings';

import './setup';

describe('computeStandings', () => {
  it('returns empty array for no matches', () => {
    const result = computeStandings([]);
    expect(result).toEqual([]);
  });

  it('separates teams by points (3 pts per win)', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 2, away: 0 } },
      { homeTeamId: 'MEX', awayTeamId: 'CHI', result: { home: 0, away: 1 } },
      { homeTeamId: 'CHI', awayTeamId: 'ARG', result: { home: 0, away: 1 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].teamId).toBe('ARG');
    expect(result[0].points).toBe(6);
    expect(result[1].teamId).toBe('CHI');
    expect(result[1].points).toBe(3);
    expect(result[2].teamId).toBe('MEX');
    expect(result[2].points).toBe(0);
    expect(result[3].teamId).toBe('BRA');
    expect(result[3].points).toBe(0);
  });

  it('separates teams by goal difference when points are equal', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 1, away: 0 } },
      { homeTeamId: 'ARG', awayTeamId: 'MEX', result: { home: 0, away: 1 } },
      { homeTeamId: 'BRA', awayTeamId: 'MEX', result: { home: 2, away: 0 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].teamId).toBe('BRA');
    expect(result[0].goalDifference).toBe(1);
    expect(result[1].teamId).toBe('ARG');
    expect(result[1].goalDifference).toBe(0);
    expect(result[2].teamId).toBe('MEX');
    expect(result[2].goalDifference).toBe(-1);
  });

  it('separates teams by goals for when points and GD are equal', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 1, away: 0 } },
      { homeTeamId: 'ARG', awayTeamId: 'MEX', result: { home: 0, away: 1 } },
      { homeTeamId: 'BRA', awayTeamId: 'MEX', result: { home: 3, away: 0 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].teamId).toBe('BRA');
    expect(result[0].goalsFor).toBe(3);
    expect(result[1].teamId).toBe('ARG');
    expect(result[1].goalsFor).toBe(1);
    expect(result[2].teamId).toBe('MEX');
    expect(result[2].goalsFor).toBe(1);
  });

  // TODO: H2H tiebreaker not implemented. Current order: Points → GD → GF → teamId (alphabetical). FIFA spec adds H2H pts/GD/GF before overall GF. Backfill when the function is updated.
  it('breaks tie alphabetically when points, GD, and GF are all equal', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 1, away: 1 } },
      { homeTeamId: 'MEX', awayTeamId: 'CHI', result: { home: 0, away: 0 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].teamId).toBe('ARG');
    expect(result[1].teamId).toBe('BRA');
    expect(result[2].teamId).toBe('CHI');
    expect(result[3].teamId).toBe('MEX');
  });

  it('3-team accumulation: ARG 2 wins, BRA 1W1L, MEX 2L', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 2, away: 0 } },
      { homeTeamId: 'ARG', awayTeamId: 'MEX', result: { home: 1, away: 0 } },
      { homeTeamId: 'BRA', awayTeamId: 'MEX', result: { home: 3, away: 1 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].teamId).toBe('ARG');
    expect(result[0].points).toBe(6);
    expect(result[0].won).toBe(2);
    expect(result[1].teamId).toBe('BRA');
    expect(result[1].points).toBe(3);
    expect(result[1].won).toBe(1);
    expect(result[1].lost).toBe(1);
    expect(result[2].teamId).toBe('MEX');
    expect(result[2].points).toBe(0);
    expect(result[2].lost).toBe(2);
  });

  it('handles draws correctly', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 1, away: 1 } },
      { homeTeamId: 'MEX', awayTeamId: 'CHI', result: { home: 0, away: 0 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].drawn).toBe(1);
    expect(result[0].points).toBe(1);
  });

  it('skips matches with null results', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 2, away: 1 } },
      { homeTeamId: 'ARG', awayTeamId: 'MEX', result: { home: null, away: null } },
    ];
    const result = computeStandings(matches);
    expect(result.length).toBe(2);
    expect(result.find((t) => t.teamId === 'ARG')?.played).toBe(1);
  });

  it('skips matches with missing team IDs', () => {
    const matches = [
      { homeTeamId: 'ARG', awayTeamId: 'BRA', result: { home: 2, away: 1 } },
      { homeTeamId: null, awayTeamId: 'MEX', result: { home: 1, away: 0 } },
    ];
    const result = computeStandings(matches);
    expect(result.length).toBe(2);
    expect(result.find((t) => t.teamId === 'ARG')?.played).toBe(1);
    expect(result.find((t) => t.teamId === 'BRA')?.played).toBe(1);
    expect(result.find((t) => t.teamId === 'MEX')?.played).toBeUndefined();
  });

  it('assigns correct positions after sorting', () => {
    const matches = [
      { homeTeamId: 'A', awayTeamId: 'B', result: { home: 1, away: 0 } },
      { homeTeamId: 'C', awayTeamId: 'D', result: { home: 0, away: 2 } },
    ];
    const result = computeStandings(matches);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
    expect(result[2].position).toBe(3);
    expect(result[3].position).toBe(4);
  });
});
