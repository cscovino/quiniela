import { describe, expect, it } from 'vitest';

import { buildDayLabel, buildMatchdayBets, type MatchInfo } from '../matchday-bets';

const matchInfo = (entries: Array<[string, MatchInfo]>) => new Map(entries);

describe('buildDayLabel', () => {
  it('formats the Spanish matchday label', () => {
    expect(buildDayLabel('2026-06-11', 1, 'es')).toBe('Jor. 1 — 11 Jun');
  });

  it('formats the English matchday label', () => {
    expect(buildDayLabel('2026-06-15', 2, 'en')).toBe('MD 2 — 15 Jun');
  });
});

describe('buildMatchdayBets', () => {
  const info = matchInfo([
    ['m1', { homeTeam: 'ARG', awayTeam: 'BRA', date: new Date('2026-06-11T18:00:00Z'), status: 'finished', actualHome: 2, actualAway: 1 }],
    ['m2', { homeTeam: 'GER', awayTeam: 'ESP', date: new Date('2026-06-11T21:00:00Z'), status: 'finished', actualHome: 1, actualAway: 1 }],
    ['m3', { homeTeam: 'MEX', awayTeam: 'USA', date: new Date('2026-06-15T18:00:00Z'), status: 'scheduled' }],
  ]);

  it('assigns matchday numbers from the global ordered set of dates', () => {
    const bets = buildMatchdayBets(
      [
        { matchId: 'm3', homeScore: 0, awayScore: 0 },
        { matchId: 'm1', homeScore: 2, awayScore: 1 },
      ],
      info,
      'es',
    );
    // Sorted chronologically; m1 (06-11) is matchday 1, m3 (06-15) is matchday 2.
    expect(bets.map((b) => b.matchId)).toEqual(['m1', 'm3']);
    expect(bets[0].dayLabel).toBe('Jor. 1 — 11 Jun');
    expect(bets[1].dayLabel).toBe('Jor. 2 — 15 Jun');
  });

  it('marks an exact prediction correct on a finished match', () => {
    const [bet] = buildMatchdayBets([{ matchId: 'm1', homeScore: 2, awayScore: 1 }], info, 'en');
    expect(bet.isExact).toBe(true);
    expect(bet.isWinner).toBe(true);
    expect(bet.actualHome).toBe(2);
    expect(bet.actualAway).toBe(1);
  });

  it('marks a correct-winner-but-wrong-score prediction as winner only', () => {
    const [bet] = buildMatchdayBets([{ matchId: 'm1', homeScore: 3, awayScore: 0 }], info, 'en');
    expect(bet.isExact).toBe(false);
    expect(bet.isWinner).toBe(true);
  });

  it('marks a wrong-outcome prediction as neither exact nor winner', () => {
    const [bet] = buildMatchdayBets([{ matchId: 'm1', homeScore: 0, awayScore: 2 }], info, 'en');
    expect(bet.isExact).toBe(false);
    expect(bet.isWinner).toBe(false);
  });

  it('leaves correctness undefined for unfinished matches', () => {
    const [bet] = buildMatchdayBets([{ matchId: 'm3', homeScore: 1, awayScore: 0 }], info, 'en');
    expect(bet.isExact).toBeUndefined();
    expect(bet.isWinner).toBeUndefined();
    expect(bet.status).toBe('scheduled');
  });

  it('drops predictions for matches missing from the live info map', () => {
    const bets = buildMatchdayBets([{ matchId: 'unknown', homeScore: 1, awayScore: 0 }], info, 'en');
    expect(bets).toEqual([]);
  });
});
