import { describe, it, expect } from 'vitest';
import {
  getGroupMatches,
  calculateGroupStandings,
  isGroupMatchesComplete,
  isGroupClassificationComplete,
  buildKnockoutBracket,
  getPredictorProgress,
  BRACKET_MAP,
} from '../predictions-flow';
import type { MatchWithId, GroupBetRecord, KnockoutBetRecord } from '../predictions-flow';

const makeMatch = (id: string, groupId: string, phase: string, home: string, away: string): MatchWithId => ({
  id,
  slug: id,
  groupId,
  phase: phase as MatchWithId['phase'],
  homeTeamId: home,
  awayTeamId: away,
  date: { toDate: () => new Date() } as MatchWithId['date'],
  stadium: 'Test Stadium',
  result: { home: null, away: null },
  status: 'scheduled',
  predictionDeadline: { toDate: () => new Date() } as MatchWithId['predictionDeadline'],
  createdAt: { toDate: () => new Date() } as MatchWithId['createdAt'],
  updatedAt: { toDate: () => new Date() } as MatchWithId['updatedAt'],
});

const teamsMap = {
  arg: { fifaCode: 'ARG', name: 'Argentina' },
  bra: { fifaCode: 'BRA', name: 'Brazil' },
  ger: { fifaCode: 'GER', name: 'Germany' },
  fra: { fifaCode: 'FRA', name: 'France' },
  esp: { fifaCode: 'ESP', name: 'Spain' },
  eng: { fifaCode: 'ENG', name: 'England' },
  por: { fifaCode: 'POR', name: 'Portugal' },
  ita: { fifaCode: 'ITA', name: 'Italy' },
};

describe('getGroupMatches', () => {
  const matches: MatchWithId[] = [
    makeMatch('m1', 'A', 'group', 'arg', 'bra'),
    makeMatch('m2', 'A', 'group', 'ger', 'fra'),
    makeMatch('m3', 'B', 'group', 'esp', 'eng'),
    makeMatch('m4', 'A', 'round-of-32', 'arg', 'esp'),
  ];

  it('returns only matches for the specified group', () => {
    const result = getGroupMatches(matches, 'A');
    expect(result).toHaveLength(2);
    expect(result.every((m) => m.groupId === 'A')).toBe(true);
  });

  it('excludes non-group phase matches', () => {
    const result = getGroupMatches(matches, 'A');
    expect(result.every((m) => m.phase === 'group')).toBe(true);
  });

  it('returns empty array for unknown group', () => {
    expect(getGroupMatches(matches, 'Z')).toEqual([]);
  });

  it('returns empty array for empty matches', () => {
    expect(getGroupMatches([], 'A')).toEqual([]);
  });
});

describe('calculateGroupStandings', () => {
  const matches: MatchWithId[] = [
    makeMatch('m1', 'A', 'group', 'arg', 'bra'),
    makeMatch('m2', 'A', 'group', 'ger', 'fra'),
    makeMatch('m3', 'A', 'group', 'arg', 'ger'),
    makeMatch('m4', 'A', 'group', 'bra', 'fra'),
    makeMatch('m5', 'A', 'group', 'arg', 'fra'),
    makeMatch('m6', 'A', 'group', 'bra', 'ger'),
  ];

  it('calculates correct standings from predictions', () => {
    const predictions = {
      m1: { home: 2, away: 1 }, // ARG beats BRA
      m2: { home: 1, away: 1 }, // GER draws FRA
      m3: { home: 3, away: 0 }, // ARG beats GER
      m4: { home: 0, away: 2 }, // BRA loses to FRA
      m5: { home: 1, away: 0 }, // ARG beats FRA
      m6: { home: 2, away: 2 }, // BRA draws GER
    };

    const standings = calculateGroupStandings(matches, predictions, teamsMap, 'A');

    expect(standings).toHaveLength(4);
    // ARG: 3 wins = 9 pts
    expect(standings[0].teamId).toBe('arg');
    expect(standings[0].points).toBe(9);
    // FRA: 1 win, 1 draw, 1 loss = 4 pts
    expect(standings[1].teamId).toBe('fra');
    expect(standings[1].points).toBe(4);
    // GER: 2 draws, 1 loss = 2 pts
    expect(standings[2].teamId).toBe('ger');
    expect(standings[2].points).toBe(2);
    // BRA: 1 draw, 2 losses = 1 pt
    expect(standings[3].teamId).toBe('bra');
    expect(standings[3].points).toBe(1);
  });

  it('skips matches without predictions', () => {
    const predictions = {
      m1: { home: 2, away: 1 },
    };

    const standings = calculateGroupStandings(matches, predictions, teamsMap, 'A');
    expect(standings.length).toBeGreaterThan(0);
    expect(standings[0].played).toBe(1);
  });

  it('skips matches with null scores', () => {
    const predictions = {
      m1: { home: 2, away: undefined },
    };

    const standings = calculateGroupStandings(matches, predictions, teamsMap, 'A');
    expect(standings).toEqual([]);
  });

  it('handles empty predictions', () => {
    const standings = calculateGroupStandings(matches, {}, teamsMap, 'A');
    expect(standings).toEqual([]);
  });

  it('handles empty matches', () => {
    const standings = calculateGroupStandings([], {}, teamsMap, 'A');
    expect(standings).toEqual([]);
  });

  it('sorts by points then goal difference', () => {
    const predictions = {
      m1: { home: 5, away: 0 }, // ARG 5-0 BRA (GD +5)
      m2: { home: 1, away: 0 }, // GER 1-0 FRA (GD +1)
    };

    const standings = calculateGroupStandings(matches, predictions, teamsMap, 'A');
    expect(standings[0].teamId).toBe('arg');
    expect(standings[0].goalsFor).toBe(5);
    expect(standings[0].goalsAgainst).toBe(0);
  });
});

describe('isGroupMatchesComplete', () => {
  const matches: MatchWithId[] = [
    makeMatch('m1', 'A', 'group', 'arg', 'bra'),
    makeMatch('m2', 'A', 'group', 'ger', 'fra'),
  ];

  it('returns true when all matches have predictions', () => {
    const predictions = {
      m1: { home: 2, away: 1 },
      m2: { home: 1, away: 1 },
    };
    expect(isGroupMatchesComplete(matches, predictions, 'A')).toBe(true);
  });

  it('returns false when some matches are missing', () => {
    const predictions = {
      m1: { home: 2, away: 1 },
    };
    expect(isGroupMatchesComplete(matches, predictions, 'A')).toBe(false);
  });

  it('returns false when predictions have null values', () => {
    const predictions = {
      m1: { home: 2, away: undefined },
      m2: { home: 1, away: 1 },
    };
    expect(isGroupMatchesComplete(matches, predictions, 'A')).toBe(false);
  });

  it('returns false for empty predictions', () => {
    expect(isGroupMatchesComplete(matches, {}, 'A')).toBe(false);
  });

  it('returns false for empty matches', () => {
    expect(isGroupMatchesComplete([], {}, 'A')).toBe(false);
  });
});

describe('isGroupClassificationComplete', () => {
  it('returns true when all positions filled with unique teams', () => {
    expect(isGroupClassificationComplete(['arg', 'bra', 'ger', 'fra'], 4)).toBe(true);
  });

  it('returns false when positions are missing', () => {
    expect(isGroupClassificationComplete(['arg', 'bra', 'ger'], 4)).toBe(false);
  });

  it('returns false when positions have duplicates', () => {
    expect(isGroupClassificationComplete(['arg', 'arg', 'ger', 'fra'], 4)).toBe(false);
  });

  it('returns false when positions have empty strings', () => {
    expect(isGroupClassificationComplete(['arg', '', 'ger', 'fra'], 4)).toBe(false);
  });

  it('returns false for empty positions', () => {
    expect(isGroupClassificationComplete([], 4)).toBe(false);
  });
});

describe('BRACKET_MAP', () => {
  it('has entries for all knockout matches', () => {
    const expectedSlugs = [
      'r32-m1', 'r32-m2', 'r32-m3', 'r32-m4', 'r32-m5', 'r32-m6', 'r32-m7', 'r32-m8',
      'r16-m1', 'r16-m2', 'r16-m3', 'r16-m4', 'r16-m5', 'r16-m6', 'r16-m7', 'r16-m8',
      'qf-m1', 'qf-m2', 'qf-m3', 'qf-m4',
      'sf-m1', 'sf-m2',
      'third-place',
      'final',
    ];

    for (const slug of expectedSlugs) {
      expect(BRACKET_MAP[slug]).toBeDefined();
      expect(BRACKET_MAP[slug].home).toBeDefined();
      expect(BRACKET_MAP[slug].away).toBeDefined();
    }
  });

  it('R32 matches reference group positions', () => {
    expect(BRACKET_MAP['r32-m1'].home.source.from).toBe('group');
    expect(BRACKET_MAP['r32-m1'].home.source.groupId).toBe('A');
    expect(BRACKET_MAP['r32-m1'].home.source.position).toBe(1);
  });

  it('R16 matches reference winners of R32', () => {
    expect(BRACKET_MAP['r16-m1'].home.source.from).toBe('winner-of');
    expect(BRACKET_MAP['r16-m1'].home.source.matchSlug).toBe('r32-m1');
  });

  it('Final references winners of semifinals', () => {
    expect(BRACKET_MAP['final'].home.source.matchSlug).toBe('sf-m1');
    expect(BRACKET_MAP['final'].away.source.matchSlug).toBe('sf-m2');
  });
});

describe('buildKnockoutBracket', () => {
  const knockoutMatches: MatchWithId[] = [
    makeMatch('r32-m1', '', 'round-of-32', '', ''),
    makeMatch('r16-m1', '', 'round-of-16', '', ''),
  ];

  it('resolves group slots to teams when bets exist', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra', 'ger', 'fra'],
      C: ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r32-m1 home should be A/1 = arg
    expect(bracket[0].homeTeam.resolvedTeam).toBe('arg');
    // r32-m1 away should be C/3 = por
    expect(bracket[0].awayTeam.resolvedTeam).toBe('por');
  });

  it('returns TBD when group bets are missing', () => {
    const groupBets: GroupBetRecord = {};
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD');
  });

  it('resolves winner-of slots from knockout bets', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra', 'ger', 'fra'],
      C: ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {
      'r32-m1': 'arg',
    };

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-m1 home should be winner of r32-m1 = arg
    expect(bracket[1].homeTeam.resolvedTeam).toBe('arg');
  });

  it('returns TBD for winner-of when knockout bet is missing', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra', 'ger', 'fra'],
      C: ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-m1 home depends on r32-m1 winner which is not set
    expect(bracket[1].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('handles partial group bets (incomplete positions)', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra'], // only 2 positions, need 3
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    expect(bracket[0].homeTeam.resolvedTeam).toBe('arg');
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD'); // C/3 not set
  });
});

describe('getPredictorProgress', () => {
  const allMatches: MatchWithId[] = [
    makeMatch('m1', 'A', 'group', 'arg', 'bra'),
    makeMatch('m2', 'A', 'group', 'ger', 'fra'),
    makeMatch('m3', 'B', 'group', 'esp', 'eng'),
    makeMatch('r32-m1', '', 'round-of-32', '', ''),
    makeMatch('r16-m1', '', 'round-of-16', '', ''),
    makeMatch('qf-m1', '', 'quarterfinals', '', ''),
  ];

  it('counts completed groups and knockout matches', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra', 'ger', 'fra'],
      B: ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {
      'r32-m1': 'arg',
    };

    const progress = getPredictorProgress(allMatches, groupBets, knockoutBets, false, false);

    expect(progress.groupsSubmitted).toBe(2);
    expect(progress.totalGroups).toBe(2);
    expect(progress.knockoutSubmitted).toBe(1);
    expect(progress.totalKnockout).toBe(3);
    expect(progress.finalSubmitted).toBe(false);
    expect(progress.bestPlayersSubmitted).toBe(false);
  });

  it('counts final phase and best players flags', () => {
    const progress = getPredictorProgress(allMatches, {}, {}, true, true);

    expect(progress.finalSubmitted).toBe(true);
    expect(progress.bestPlayersSubmitted).toBe(true);
  });

  it('returns zeros for empty data', () => {
    const progress = getPredictorProgress([], {}, {}, false, false);

    expect(progress.groupsSubmitted).toBe(0);
    expect(progress.totalGroups).toBe(0);
    expect(progress.knockoutSubmitted).toBe(0);
    expect(progress.totalKnockout).toBe(0);
  });

  it('does not count incomplete group submissions', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra'], // only 2 positions, not 4
    };

    const progress = getPredictorProgress(allMatches, groupBets, {}, false, false);

    expect(progress.groupsSubmitted).toBe(0);
    expect(progress.totalGroups).toBe(2);
  });
});
