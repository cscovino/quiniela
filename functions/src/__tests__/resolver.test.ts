import { describe, expect, it } from 'vitest';

import {
  diffResolution,
  type GroupStandingsData,
  type MatchResult,
  resolveAllBrackets,
  type TeamStanding,
} from '../knockout/resolver';

import './setup';

const makeStanding = (teamId: string, position: number, points: number): TeamStanding => ({
  teamId,
  position,
  played: 3,
  won: position === 1 ? 3 : position === 2 ? 2 : 1,
  drawn: 0,
  lost: position === 4 ? 3 : 0,
  goalsFor: 5,
  goalsAgainst: 2,
  goalDifference: 3,
  points,
});

const standingsA: TeamStanding[] = [
  makeStanding('MEX', 1, 9),
  makeStanding('KOR', 2, 6),
  makeStanding('RSA', 3, 3),
  makeStanding('CZE', 4, 0),
];

const standingsB: TeamStanding[] = [
  makeStanding('CAN', 1, 9),
  makeStanding('BIH', 2, 6),
  makeStanding('QAT', 3, 3),
  makeStanding('SUI', 4, 0),
];

const standingsC: TeamStanding[] = [
  makeStanding('BRA', 1, 9),
  makeStanding('MAR', 2, 6),
  makeStanding('HAI', 3, 3),
  makeStanding('SCO', 4, 0),
];

const standingsD: TeamStanding[] = [
  makeStanding('USA', 1, 9),
  makeStanding('URU', 2, 6),
  makeStanding('PAR', 3, 3),
  makeStanding('BOL', 4, 0),
];

const standingsE: TeamStanding[] = [
  makeStanding('GER', 1, 9),
  makeStanding('NED', 2, 6),
  makeStanding('JPN', 3, 3),
  makeStanding('TUN', 4, 0),
];

const standingsF: TeamStanding[] = [
  makeStanding('FRA', 1, 9),
  makeStanding('SEN', 2, 6),
  makeStanding('AUS', 3, 3),
  makeStanding('DEN', 4, 0),
];

const standingsG: TeamStanding[] = [
  makeStanding('ESP', 1, 9),
  makeStanding('IRN', 2, 6),
  makeStanding('NGA', 3, 3),
  makeStanding('CRC', 4, 0),
];

const standingsH: TeamStanding[] = [
  makeStanding('ARG', 1, 9),
  makeStanding('POL', 2, 6),
  makeStanding('KSA', 3, 3),
  makeStanding('MEX', 4, 0),
];

const standingsI: TeamStanding[] = [
  makeStanding('POR', 1, 9),
  makeStanding('GHA', 2, 6),
  makeStanding('EGY', 3, 3),
  makeStanding('CIV', 4, 0),
];

const standingsJ: TeamStanding[] = [
  makeStanding('ENG', 1, 9),
  makeStanding('WAL', 2, 6),
  makeStanding('USA', 3, 3),
  makeStanding('IRN', 4, 0),
];

const standingsK: TeamStanding[] = [
  makeStanding('NED', 1, 9),
  makeStanding('UKR', 2, 6),
  makeStanding('ECU', 3, 3),
  makeStanding('SVN', 4, 0),
];

const standingsL: TeamStanding[] = [
  makeStanding('BEL', 1, 9),
  makeStanding('SVK', 2, 6),
  makeStanding('IRL', 3, 3),
  makeStanding('ITA', 4, 0),
];

const allGroupStandings: GroupStandingsData[] = [
  { groupId: 'group-a', standings: standingsA },
  { groupId: 'group-b', standings: standingsB },
  { groupId: 'group-c', standings: standingsC },
  { groupId: 'group-d', standings: standingsD },
  { groupId: 'group-e', standings: standingsE },
  { groupId: 'group-f', standings: standingsF },
  { groupId: 'group-g', standings: standingsG },
  { groupId: 'group-h', standings: standingsH },
  { groupId: 'group-i', standings: standingsI },
  { groupId: 'group-j', standings: standingsJ },
  { groupId: 'group-k', standings: standingsK },
  { groupId: 'group-l', standings: standingsL },
];

const finishedMatch = (
  slug: string,
  homeTeamId: string,
  awayTeamId: string,
  home: number,
  away: number,
): MatchResult => ({
  slug,
  status: 'finished',
  homeTeamId,
  awayTeamId,
  result: { home, away },
});

describe('resolveAllBrackets — R32', () => {
  it('resolves r32-1 (2A vs 2B) from group standings', () => {
    const result = resolveAllBrackets(allGroupStandings, []);
    const r32_1 = result.resolved.find((m) => m.slug === 'r32-1');
    expect(r32_1).toEqual({ slug: 'r32-1', homeTeamId: 'KOR', awayTeamId: 'BIH' });
  });

  it('resolves r32-7 (1A vs best-third matrix slot M79)', () => {
    const tuned: GroupStandingsData[] = allGroupStandings.map((g) => {
      const letter = g.groupId.replace('group-', '').toUpperCase();
      const advancing = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(letter);
      const third = g.standings[2];
      const newThird = advancing
        ? { ...third, points: 4, goalDifference: 1, goalsFor: 4 }
        : { ...third, points: 1, goalDifference: -1, goalsFor: 1 };
      return { ...g, standings: [g.standings[0], g.standings[1], newThird, g.standings[3]] };
    });
    const result = resolveAllBrackets(tuned, []);
    const r32_7 = result.resolved.find((m) => m.slug === 'r32-7');
    expect(r32_7?.homeTeamId).toBe('MEX');
    expect(r32_7?.awayTeamId).toBe('KSA');
  });

  it('uses uppercase teamIds in resolution (canonical)', () => {
    const lowercaseStandings: GroupStandingsData[] = allGroupStandings.map((g) => ({
      ...g,
      standings: g.standings.map((s) => ({ ...s, teamId: s.teamId.toLowerCase() })),
    }));
    const result = resolveAllBrackets(lowercaseStandings, []);
    const r32_1 = result.resolved.find((m) => m.slug === 'r32-1');
    expect(r32_1?.homeTeamId).toBe('KOR');
    expect(r32_1?.awayTeamId).toBe('BIH');
  });

  it('leaves best-third R32 slots unresolved when fewer than 8 third-place teams are known', () => {
    const partial = allGroupStandings.slice(0, 4);
    const result = resolveAllBrackets(partial, []);
    const bestThirdMatches = [
      'r32-2',
      'r32-5',
      'r32-7',
      'r32-8',
      'r32-9',
      'r32-10',
      'r32-13',
      'r32-15',
    ];
    const resolved = result.resolved.filter((m) => bestThirdMatches.includes(m.slug));
    expect(resolved).toHaveLength(0);
    const groupOnlyMatches = result.resolved.filter((m) => m.slug.startsWith('r32-'));
    expect(groupOnlyMatches.every((m) => ['r32-1', 'r32-3', 'r32-4'].includes(m.slug))).toBe(true);
  });
});

describe('resolveAllBrackets — R16', () => {
  it('resolves r16-1 from r32 winners', () => {
    const r32 = finishedMatch('r32-2', 'GER', 'ARG', 1, 0);
    const r32b = finishedMatch('r32-5', 'POR', 'BRA', 2, 1);
    const result = resolveAllBrackets(allGroupStandings, [r32, r32b]);
    const r16_1 = result.resolved.find((m) => m.slug === 'r16-1');
    expect(r16_1).toEqual({ slug: 'r16-1', homeTeamId: 'GER', awayTeamId: 'POR' });
  });

  it('leaves r16 unresolved if feeders not finished', () => {
    const r32 = finishedMatch('r32-2', 'GER', 'ARG', 1, 0);
    const r32b: MatchResult = {
      slug: 'r32-5',
      status: 'live',
      homeTeamId: 'POR',
      awayTeamId: 'BRA',
      result: { home: 1, away: 1 },
    };
    const result = resolveAllBrackets(allGroupStandings, [r32, r32b]);
    const r16_1 = result.resolved.find((m) => m.slug === 'r16-1');
    expect(r16_1).toBeUndefined();
  });
});

describe('resolveAllBrackets — final & third-place', () => {
  it('resolves final from sf-1 and sf-2 winners', () => {
    const sf1 = finishedMatch('sf-1', 'ARG', 'FRA', 2, 0);
    const sf2 = finishedMatch('sf-2', 'BRA', 'GER', 1, 2);
    const result = resolveAllBrackets(allGroupStandings, [sf1, sf2]);
    const final = result.resolved.find((m) => m.slug === 'final');
    expect(final).toEqual({ slug: 'final', homeTeamId: 'ARG', awayTeamId: 'GER' });
  });

  it('resolves third-place from sf-1 and sf-2 losers', () => {
    const sf1 = finishedMatch('sf-1', 'ARG', 'FRA', 2, 0);
    const sf2 = finishedMatch('sf-2', 'BRA', 'GER', 1, 2);
    const result = resolveAllBrackets(allGroupStandings, [sf1, sf2]);
    const tp = result.resolved.find((m) => m.slug === 'third-place');
    expect(tp).toEqual({ slug: 'third-place', homeTeamId: 'FRA', awayTeamId: 'BRA' });
  });

  it('returns empty if only one SF is finished', () => {
    const sf1 = finishedMatch('sf-1', 'ARG', 'FRA', 2, 0);
    const result = resolveAllBrackets(allGroupStandings, [sf1]);
    const final = result.resolved.find((m) => m.slug === 'final');
    expect(final).toBeUndefined();
  });
});

describe('diffResolution', () => {
  it('emits a change when current is null and new is resolved', () => {
    const resolution = {
      resolved: [{ slug: 'r32-1', homeTeamId: 'KOR', awayTeamId: 'BIH' }],
      unresolved: [],
    };
    const current = new Map<string, { homeTeamId: string | null; awayTeamId: string | null }>();
    current.set('r32-1', { homeTeamId: null, awayTeamId: null });
    const changes = diffResolution(current, resolution);
    expect(changes).toEqual([{ slug: 'r32-1', homeTeamId: 'KOR', awayTeamId: 'BIH' }]);
  });

  it('emits nothing when already up to date', () => {
    const resolution = {
      resolved: [{ slug: 'r32-1', homeTeamId: 'KOR', awayTeamId: 'BIH' }],
      unresolved: [],
    };
    const current = new Map<string, { homeTeamId: string | null; awayTeamId: string | null }>();
    current.set('r32-1', { homeTeamId: 'KOR', awayTeamId: 'BIH' });
    const changes = diffResolution(current, resolution);
    expect(changes).toEqual([]);
  });
});
