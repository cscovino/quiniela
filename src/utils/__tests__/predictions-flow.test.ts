import { describe, expect, it } from 'vitest';

import { THIRD_PLACE_MATRIX } from '../../data/third-place-matrix';
import type { GroupBetRecord, KnockoutBetRecord, MatchWithId } from '../predictions-flow';
import {
  buildKnockoutBracket,
  calculateGroupStandings,
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
  it.todo(
    'has entries for all 32 knockout matches (r32-1..r32-16, r16-1..r16-8, qf-1..qf-4, sf-1/sf-2, third-place, final)',
  );

  it.todo('R32 matches reference group positions with group-a slug form (not bare A)');

  it.todo('R16 matches reference winners of R32 using seed-canonical slugs (r32-1, not r32-m1)');

  it.todo('Final references winners of semifinals using seed-canonical slugs (sf-1/sf-2)');
});

describe('buildKnockoutBracket', () => {
  it.todo('resolves group-a slot to team when group bets use slug-form keys (group-a, not A)');

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

  it.todo('resolves winner-of slots from knockout bets using seed-canonical slugs (r32-1)');

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

  it.todo('handles partial group bets (incomplete positions) with seed-canonical slugs');
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

describe('deriveFinalFour', () => {
  it.todo('returns all TBD when no knockout picks exist (D-01)');
  it.todo('returns correct first/second/third/fourth when all picks are set');
  it.todo('returns first/second TBD when final stored pick is stale (D-02)');
  it.todo('partial: returns first/second when only final is predicted (third/fourth TBD)');
});

describe('computeThirdPlaceStandings (rewrite)', () => {
  it.todo('returns non-zero points when matchPredictions are provided (KO-02)');
  it.todo('normalizes group-a slug to A for getCombinationKey');
  it.todo('uses confirmed advancing set when provided (D-04)');
  it.todo('defaults to top-8 when confirmedAdvancingGroupSlugs is omitted');
  it.todo('returns advancing:false with no bracketMatchSlug when fewer than 8 advance (D-05)');
  it.todo('tiebreaker: equal points/GD/GF → stable by group letter then teamId (D-03)');
});

describe('THIRD_PLACE_MATRIX static import', () => {
  it('is available synchronously (no async needed)', () => {
    expect(THIRD_PLACE_MATRIX).toBeDefined();
    expect(Object.keys(THIRD_PLACE_MATRIX).length).toBe(495);
  });
});
