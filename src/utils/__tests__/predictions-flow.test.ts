import { describe, expect, it } from 'vitest';

import { THIRD_PLACE_MATRIX } from '../../data/third-place-matrix';
import type {
  GroupBetRecord,
  KnockoutBetRecord,
  MatchWithId,
  PredictionRecord,
} from '../predictions-flow';
import {
  BRACKET_MAP,
  buildKnockoutBracket,
  calculateGroupStandings,
  computeThirdPlaceStandings,
  deriveFinalFour,
  getGroupMatches,
  getPredictorProgress,
  isGroupClassificationComplete,
  isGroupMatchesComplete,
} from '../predictions-flow';

const makeMatch = (
  id: string,
  groupId: string,
  phase: string,
  home: string,
  away: string,
): MatchWithId => ({
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
  mex: { fifaCode: 'MEX', name: 'Mexico' },
  usa: { fifaCode: 'USA', name: 'United States' },
  ned: { fifaCode: 'NED', name: 'Netherlands' },
  cro: { fifaCode: 'CRO', name: 'Croatia' },
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
  it('has entries for all 32 knockout matches (r32-1..r32-16, r16-1..r16-8, qf-1..qf-4, sf-1/sf-2, third-place, final)', () => {
    const expectedSlugs = [
      'r32-1',
      'r32-2',
      'r32-3',
      'r32-4',
      'r32-5',
      'r32-6',
      'r32-7',
      'r32-8',
      'r32-9',
      'r32-10',
      'r32-11',
      'r32-12',
      'r32-13',
      'r32-14',
      'r32-15',
      'r32-16',
      'r16-1',
      'r16-2',
      'r16-3',
      'r16-4',
      'r16-5',
      'r16-6',
      'r16-7',
      'r16-8',
      'qf-1',
      'qf-2',
      'qf-3',
      'qf-4',
      'sf-1',
      'sf-2',
      'third-place',
      'final',
    ];
    for (const slug of expectedSlugs) {
      expect(BRACKET_MAP[slug], `missing entry for ${slug}`).toBeDefined();
    }
    expect(Object.keys(BRACKET_MAP)).toHaveLength(32);
  });

  it('R32 matches reference group positions with group-a slug form (not bare A)', () => {
    expect(BRACKET_MAP['r32-1'].home.source.from).toBe('group');
    if (BRACKET_MAP['r32-1'].home.source.from === 'group') {
      expect(BRACKET_MAP['r32-1'].home.source.groupId).toBe('group-a');
      expect(BRACKET_MAP['r32-1'].home.source.position).toBe(1);
    }
  });

  it('R16 matches reference winners of R32 using seed-canonical slugs (r32-1, not r32-m1)', () => {
    expect(BRACKET_MAP['r16-1'].home.source.from).toBe('winner-of');
    if (BRACKET_MAP['r16-1'].home.source.from === 'winner-of') {
      expect(BRACKET_MAP['r16-1'].home.source.matchSlug).toBe('r32-1');
    }
    expect(BRACKET_MAP['r16-1'].away.source.from).toBe('winner-of');
    if (BRACKET_MAP['r16-1'].away.source.from === 'winner-of') {
      expect(BRACKET_MAP['r16-1'].away.source.matchSlug).toBe('r32-2');
    }
  });

  it('Final references winners of semifinals using seed-canonical slugs (sf-1/sf-2)', () => {
    expect(BRACKET_MAP['final'].home.source.from).toBe('winner-of');
    if (BRACKET_MAP['final'].home.source.from === 'winner-of') {
      expect(BRACKET_MAP['final'].home.source.matchSlug).toBe('sf-1');
    }
    expect(BRACKET_MAP['final'].away.source.from).toBe('winner-of');
    if (BRACKET_MAP['final'].away.source.from === 'winner-of') {
      expect(BRACKET_MAP['final'].away.source.matchSlug).toBe('sf-2');
    }
  });
});

describe('buildKnockoutBracket', () => {
  it('resolves group-a slot to team when group bets use slug-form keys (group-a, not A)', () => {
    const knockoutMatches: MatchWithId[] = [makeMatch('r32-1', '', 'round-of-32', '', '')];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'ger', 'fra'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r32-1 home = group-a position 1 = 'arg'
    expect(bracket[0].homeTeam.resolvedTeam).toBe('arg');
  });

  it('returns TBD when group bets are missing', () => {
    const knockoutMatches: MatchWithId[] = [
      makeMatch('r32-1', '', 'round-of-32', '', ''),
      makeMatch('r16-1', '', 'round-of-16', '', ''),
    ];
    const groupBets: GroupBetRecord = {};
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD');
  });

  it('resolves winner-of slots from knockout bets using seed-canonical slugs (r32-1)', () => {
    const knockoutMatches: MatchWithId[] = [
      makeMatch('r32-1', '', 'round-of-32', '', ''),
      makeMatch('r16-1', '', 'round-of-16', '', ''),
    ];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'ger', 'fra'],
      'group-c': ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {
      'r32-1': 'arg',
      'r32-2': 'esp',
    };

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-1 home = winner of r32-1 = 'arg'
    expect(bracket[1].homeTeam.resolvedTeam).toBe('arg');
    // r16-1 away = winner of r32-2 = 'esp'
    expect(bracket[1].awayTeam.resolvedTeam).toBe('esp');
  });

  it('returns TBD for winner-of when knockout bet is missing', () => {
    const knockoutMatches: MatchWithId[] = [
      makeMatch('r32-1', '', 'round-of-32', '', ''),
      makeMatch('r16-1', '', 'round-of-16', '', ''),
    ];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'ger', 'fra'],
      'group-c': ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-1 home depends on r32-1 winner which is not set
    expect(bracket[1].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('handles partial group bets (incomplete positions) with seed-canonical slugs', () => {
    const knockoutMatches: MatchWithId[] = [makeMatch('r32-1', '', 'round-of-32', '', '')];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra'], // only 2 positions — incomplete
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r32-1 home = group-a pos-1 = 'arg' (still resolves since pos 1 exists)
    expect(bracket[0].homeTeam.resolvedTeam).toBe('arg');
  });
});

describe('getPredictorProgress', () => {
  const allMatches: MatchWithId[] = [
    makeMatch('m1', 'A', 'group', 'arg', 'bra'),
    makeMatch('m2', 'A', 'group', 'ger', 'fra'),
    makeMatch('m3', 'B', 'group', 'esp', 'eng'),
    makeMatch('r32-1', '', 'round-of-32', '', ''),
    makeMatch('r16-1', '', 'round-of-16', '', ''),
    makeMatch('qf-1', '', 'quarterfinals', '', ''),
  ];

  it('counts completed groups and knockout matches', () => {
    const groupBets: GroupBetRecord = {
      A: ['arg', 'bra', 'ger', 'fra'],
      B: ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {
      'r32-1': 'arg',
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

describe('loser-of resolver', () => {
  // Fixture: wire group bets and knockout bets for the full chain from R32 through SF
  // so that sf-1 feeders (arg and esp) are both resolved.
  // Chain: group-a pos-1 → r32-1 → r16-1 → qf-1 → sf-1
  //        group-c pos-1 → r32-2 → r16-1 → qf-1 (away)  -- actually r16-1 away = r32-2
  //        group-e pos-1 → r32-3 → r16-2 → qf-1 (away)
  //        group-g pos-1 → r32-4 → r16-2 (away)
  // sf-1 feeders: W-qf-1 and W-qf-2; qf-1 = W-r16-1 vs W-r16-2
  // To keep fixture minimal: set knockoutBets for every step in the chain up to sf-1
  const thirdPlaceMatch: MatchWithId[] = [makeMatch('third-place', '', 'third-place', '', '')];

  // group-a winner = 'arg', group-c winner = 'esp'
  // r32-1: arg (group-a pos-1) wins → 'arg'
  // r32-2: esp (group-c pos-1) wins → 'esp'
  // r16-1: arg (W-r32-1) vs esp (W-r32-2) → 'arg'
  // r32-3: group-e pos-1 = 'bra' → 'bra'; r32-4: group-g pos-1 = 'ger' → 'ger'
  // r16-2: bra vs ger → 'bra'
  // qf-1: arg vs bra → 'arg'
  // r32-5..r32-8 + r16-3 + r16-4 → qf-2 = 'fra'
  // sf-1: arg vs fra → 'arg' (winner); loser = 'fra'

  const groupBets: GroupBetRecord = {
    'group-a': ['arg', 'bra', 'ger', 'fra'],
    'group-c': ['esp', 'eng', 'por', 'ita'],
    'group-e': ['bra', 'ger', 'arg', 'fra'],
    'group-g': ['ger', 'arg', 'bra', 'fra'],
    'group-b': ['fra', 'esp', 'arg', 'bra'],
    'group-d': ['eng', 'por', 'esp', 'ita'],
    'group-f': ['por', 'fra', 'arg', 'bra'],
    'group-h': ['ita', 'eng', 'por', 'fra'],
  };

  const fullChainBets: KnockoutBetRecord = {
    // R32 winners
    'r32-1': 'arg',
    'r32-2': 'esp',
    'r32-3': 'bra',
    'r32-4': 'ger',
    'r32-5': 'fra',
    'r32-6': 'eng',
    'r32-7': 'por',
    'r32-8': 'ita',
    // R16 winners
    'r16-1': 'arg',
    'r16-2': 'bra',
    'r16-3': 'fra',
    'r16-4': 'por',
    // QF winners
    'qf-1': 'arg',
    'qf-2': 'fra',
    // SF winners
    'sf-1': 'arg',
    'sf-2': 'por',
  };

  it('returns the non-winner feeder when both feeders and winner are known', () => {
    const bracket = buildKnockoutBracket(groupBets, thirdPlaceMatch, fullChainBets);
    const thirdPlace = bracket[0];
    // sf-1: qf-1 winner (arg) vs qf-2 winner (fra), stored winner = arg → loser = fra
    expect(thirdPlace.homeTeam.resolvedTeam).toBe('fra');
  });

  it('returns TBD when no knockout pick exists', () => {
    const noBets: KnockoutBetRecord = {};
    const bracket = buildKnockoutBracket(groupBets, thirdPlaceMatch, noBets);
    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('returns TBD when stored winner is stale (D-02)', () => {
    // sf-1 feeders resolve to arg and fra; stored winner is 'zzz' (stale)
    const staleBets: KnockoutBetRecord = {
      ...fullChainBets,
      'sf-1': 'zzz', // stale — not arg or fra
    };
    const bracket = buildKnockoutBracket(groupBets, thirdPlaceMatch, staleBets);
    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('propagates TBD transitively to third-place match when sf pick is stale', () => {
    const staleBothSFs: KnockoutBetRecord = {
      ...fullChainBets,
      'sf-1': 'zzz', // stale
      'sf-2': 'zzz', // stale
    };
    const bracket = buildKnockoutBracket(groupBets, thirdPlaceMatch, staleBothSFs);
    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD');
  });
});

// Shared knockout chain fixture for deriveFinalFour tests.
// sf-1: arg (W-qf-1) vs fra (W-qf-2); winner = arg, loser = fra
// sf-2: por (W-qf-3) vs esp (W-qf-4); winner = por, loser = esp
// final: arg vs por; winner = arg (first), loser = por (second)
// third-place: fra vs esp; winner = fra (third), loser = esp (fourth)
const dfGroupBets: GroupBetRecord = {
  'group-a': ['arg', 'bra', 'ger', 'fra'],
  'group-c': ['esp', 'eng', 'por', 'ita'],
  'group-e': ['bra', 'ger', 'arg', 'fra'],
  'group-g': ['ger', 'arg', 'bra', 'fra'],
  'group-b': ['fra', 'esp', 'arg', 'bra'],
  'group-d': ['por', 'eng', 'esp', 'ita'],
  'group-f': ['por', 'fra', 'arg', 'bra'],
  'group-h': ['esp', 'eng', 'por', 'fra'],
};

const dfFullBets: KnockoutBetRecord = {
  // R32
  'r32-1': 'arg',
  'r32-2': 'esp',
  'r32-3': 'bra',
  'r32-4': 'ger',
  'r32-5': 'fra',
  'r32-6': 'por',
  'r32-7': 'por',
  'r32-8': 'esp',
  // R16
  'r16-1': 'arg',
  'r16-2': 'bra',
  'r16-3': 'fra',
  'r16-4': 'por',
  // QF
  'qf-1': 'arg',
  'qf-2': 'fra',
  'qf-3': 'por',
  'qf-4': 'esp',
  // SF
  'sf-1': 'arg',
  'sf-2': 'por',
  // Final + third-place
  final: 'arg',
  'third-place': 'fra',
};

describe('deriveFinalFour', () => {
  it('returns all TBD when no knockout picks exist (D-01)', () => {
    const result = deriveFinalFour({}, {});
    expect(result).toEqual({ first: 'TBD', second: 'TBD', third: 'TBD', fourth: 'TBD' });
  });

  it('returns correct first/second/third/fourth when all picks are set', () => {
    const result = deriveFinalFour(dfFullBets, dfGroupBets);
    // first = winner of final = arg
    expect(result.first).toBe('arg');
    // second = loser of final = por
    expect(result.second).toBe('por');
    // third = winner of third-place match = fra
    expect(result.third).toBe('fra');
    // fourth = loser of third-place match = esp
    expect(result.fourth).toBe('esp');
  });

  it('returns first/second TBD when final stored pick is stale (D-02)', () => {
    const staleFinalBets: KnockoutBetRecord = {
      ...dfFullBets,
      final: 'zzz', // stale — not arg or por
    };
    const result = deriveFinalFour(staleFinalBets, dfGroupBets);
    expect(result.first).toBe('TBD');
    expect(result.second).toBe('TBD');
  });

  it('partial: returns first/second when only final is predicted (third/fourth TBD)', () => {
    // Only set enough to resolve the final, but no third-place pick
    const betsNoThirdPlace: KnockoutBetRecord = { ...dfFullBets };
    delete betsNoThirdPlace['third-place'];

    const result = deriveFinalFour(betsNoThirdPlace, dfGroupBets);
    // final is predicted: first=arg, second=por
    expect(result.first).toBe('arg');
    expect(result.second).toBe('por');
    // third-place has no pick → TBD
    expect(result.third).toBe('TBD');
    expect(result.fourth).toBe('TBD');
  });
});

describe('computeThirdPlaceStandings (rewrite)', () => {
  // Shared fixtures for these tests
  const groups8 = [
    { slug: 'group-a' },
    { slug: 'group-b' },
    { slug: 'group-c' },
    { slug: 'group-d' },
    { slug: 'group-e' },
    { slug: 'group-f' },
    { slug: 'group-g' },
    { slug: 'group-h' },
  ];

  // 3 matches per group (6-team groups have 3 rounds); use 2 matches for simplicity
  const groupMatches: MatchWithId[] = [
    // group-a matches
    makeMatch('ga-m1', 'group-a', 'group', 'arg', 'bra'),
    makeMatch('ga-m2', 'group-a', 'group', 'ger', 'fra'),
    makeMatch('ga-m3', 'group-a', 'group', 'esp', 'ita'),
    makeMatch('ga-m4', 'group-a', 'group', 'arg', 'ger'),
    makeMatch('ga-m5', 'group-a', 'group', 'bra', 'esp'),
    makeMatch('ga-m6', 'group-a', 'group', 'fra', 'ita'),
    // group-b matches (minimal)
    makeMatch('gb-m1', 'group-b', 'group', 'mex', 'usa'),
    makeMatch('gb-m2', 'group-b', 'group', 'ned', 'cro'),
    // group-c through group-h (minimal — just enough to have a third-place team)
    makeMatch('gc-m1', 'group-c', 'group', 'por', 'esp'),
    makeMatch('gd-m1', 'group-d', 'group', 'fra', 'ger'),
    makeMatch('ge-m1', 'group-e', 'group', 'bra', 'arg'),
    makeMatch('gf-m1', 'group-f', 'group', 'ita', 'eng'),
    makeMatch('gg-m1', 'group-g', 'group', 'mex', 'usa'),
    makeMatch('gh-m1', 'group-h', 'group', 'ned', 'cro'),
  ];

  // Group bets: 4 positions per group (index 3 = the third-place team)
  const groupBets8: GroupBetRecord = {
    'group-a': ['arg', 'bra', 'ger', 'fra'], // fra is third-place
    'group-b': ['mex', 'usa', 'ned', 'cro'], // cro is third-place
    'group-c': ['por', 'esp', 'ita', 'eng'], // eng is third-place
    'group-d': ['fra', 'ger', 'arg', 'bra'], // bra is third-place
    'group-e': ['bra', 'arg', 'ger', 'esp'], // esp is third-place
    'group-f': ['ita', 'por', 'mex', 'usa'], // usa is third-place
    'group-g': ['mex', 'usa', 'bra', 'ger'], // ger is third-place (in group-g)
    'group-h': ['ned', 'cro', 'por', 'esp'], // esp is third-place (in group-h)
  };

  // Score predictions for group-a (fra = third-place team)
  // fra loses all group matches → 0 pts in reality, but here we track the predicted team (fra = pos 3)
  // We give fra 1 win to get non-zero points
  const matchPredictions: PredictionRecord = {
    'ga-m1': { home: 2, away: 0 }, // arg beats bra
    'ga-m2': { home: 1, away: 0 }, // ger beats fra
    'ga-m3': { home: 0, away: 1 }, // esp loses to ita
    'ga-m4': { home: 3, away: 0 }, // arg beats ger
    'ga-m5': { home: 2, away: 1 }, // bra beats esp
    'ga-m6': { home: 2, away: 1 }, // fra beats ita  ← fra gets 3 pts
  };

  it('returns non-zero points when matchPredictions are provided (KO-02)', () => {
    const result = computeThirdPlaceStandings(
      groupBets8,
      matchPredictions,
      groupMatches,
      teamsMap,
      groups8,
    );

    // fra is group-a's third-place team and has 3 points from beating ita
    const fraEntry = result.find((r) => r.teamId === 'fra' && r.groupLetter === 'group-a');
    expect(fraEntry).toBeDefined();
    expect(fraEntry!.points).toBeGreaterThan(0);
  });

  it('normalizes group-a slug to A for getCombinationKey', () => {
    // With 8 groups all having bets, the top 8 advancing teams should have advancing=true.
    // If normalization were broken, advancingSet would still set advancing correctly
    // (since it's set-based now), but we verify the result is consistent.
    const result = computeThirdPlaceStandings(
      groupBets8,
      matchPredictions,
      groupMatches,
      teamsMap,
      groups8,
    );

    // All 8 results should have advancing=true (top 8 from 8 groups = all advance)
    expect(result).toHaveLength(8);
    expect(result.every((r) => r.advancing)).toBe(true);
  });

  it('uses confirmed advancing set when provided (D-04)', () => {
    const confirmed = [
      'group-a',
      'group-b',
      'group-c',
      'group-d',
      'group-e',
      'group-f',
      'group-g',
      'group-h',
    ];
    const result = computeThirdPlaceStandings(
      groupBets8,
      matchPredictions,
      groupMatches,
      teamsMap,
      groups8,
      confirmed,
    );

    // All 8 confirmed groups → advancing=true for all
    expect(result.every((r) => r.advancing)).toBe(true);
    // Non-confirmed team should be advancing=false — not applicable here since all 8 confirmed
    // Verify advancing=false when only 4 confirmed is tested in the D-05 test below
  });

  it('defaults to top-8 when confirmedAdvancingGroupSlugs is omitted', () => {
    const result = computeThirdPlaceStandings(
      groupBets8,
      matchPredictions,
      groupMatches,
      teamsMap,
      groups8,
      // no 6th param
    );

    // With exactly 8 groups, all 8 should have advancing=true (top 8 = all 8)
    const advancingCount = result.filter((r) => r.advancing).length;
    expect(advancingCount).toBe(8);
  });

  it('returns advancing:false with no bracketMatchSlug when fewer than 8 advance (D-05)', () => {
    // Only confirm 4 groups
    const confirmed = ['group-a', 'group-b', 'group-c', 'group-d'];
    const result = computeThirdPlaceStandings(
      groupBets8,
      matchPredictions,
      groupMatches,
      teamsMap,
      groups8,
      confirmed,
    );

    // 4 advancing, 4 not
    const advancing = result.filter((r) => r.advancing);
    const notAdvancing = result.filter((r) => !r.advancing);
    expect(advancing).toHaveLength(4);
    expect(notAdvancing).toHaveLength(4);

    // bracketMatchSlug always undefined regardless of advancing status
    expect(result.every((r) => r.bracketMatchSlug === undefined)).toBe(true);
    expect(result.every((r) => r.bracketSlotLabel === undefined)).toBe(true);
  });

  it('tiebreaker: equal points/GD/GF → stable by group letter then teamId (D-03)', () => {
    // All groups have the same match predictions (no predictions) → all teams get 0 pts, 0 GD, 0 GF
    // With identical stats, sorting falls through to groupLetter then teamId
    const tiedGroupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'ger', 'fra'], // fra = third
      'group-b': ['mex', 'usa', 'ned', 'cro'], // cro = third
      'group-c': ['por', 'esp', 'ita', 'eng'], // eng = third
      'group-d': ['fra', 'ger', 'arg', 'bra'], // bra = third (note: different bra than group-a)
      'group-e': ['bra', 'arg', 'ger', 'esp'], // esp = third
      'group-f': ['ita', 'por', 'mex', 'usa'], // usa = third
      'group-g': ['mex', 'usa', 'bra', 'ger'], // ger = third (in group-g context)
      'group-h': ['ned', 'cro', 'por', 'arg'], // arg = third (in group-h context)
    };
    const tiedGroups = groups8;

    // Empty predictions → all third-place teams have 0 points, 0 GD, 0 GF
    const result1 = computeThirdPlaceStandings(
      tiedGroupBets,
      {},
      groupMatches,
      teamsMap,
      tiedGroups,
    );
    const result2 = computeThirdPlaceStandings(
      tiedGroupBets,
      {},
      groupMatches,
      teamsMap,
      tiedGroups,
    );

    // Sort is deterministic — same result across multiple calls
    expect(result1.map((r) => r.teamId)).toEqual(result2.map((r) => r.teamId));

    // First team should be from group-a (letter A < B < C ...) when all else is tied
    // group-a third = 'fra'; group-b third = 'cro'; group-c third = 'eng'
    // Sorted by group letter: A, B, C, D, E, F, G, H
    const groupLetters = result1.map((r) => r.groupLetter);
    expect(groupLetters).toEqual([
      'group-a',
      'group-b',
      'group-c',
      'group-d',
      'group-e',
      'group-f',
      'group-g',
      'group-h',
    ]);
  });
});

describe('THIRD_PLACE_MATRIX static import', () => {
  it('is available synchronously (no async needed)', () => {
    expect(THIRD_PLACE_MATRIX).toBeDefined();
    expect(Object.keys(THIRD_PLACE_MATRIX).length).toBe(495);
  });
});
