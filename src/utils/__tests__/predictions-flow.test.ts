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
  formatSlotSource,
  getGroupMatches,
  getPredictorProgress,
  isGroupClassificationComplete,
  isGroupMatchesComplete,
  type SlotSourceLabels,
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

  it('R32 matches reference group positions with group-slug form (not bare letter)', () => {
    // r32-1 = M73: 2A vs 2B — runner-up vs runner-up
    expect(BRACKET_MAP['r32-1'].home.source.from).toBe('group');
    if (BRACKET_MAP['r32-1'].home.source.from === 'group') {
      expect(BRACKET_MAP['r32-1'].home.source.groupId).toBe('group-a');
      expect(BRACKET_MAP['r32-1'].home.source.position).toBe(2);
    }
    // r32-2 = M74: 1E vs best-third — winner vs best-third
    expect(BRACKET_MAP['r32-2'].home.source.from).toBe('group');
    if (BRACKET_MAP['r32-2'].home.source.from === 'group') {
      expect(BRACKET_MAP['r32-2'].home.source.groupId).toBe('group-e');
      expect(BRACKET_MAP['r32-2'].home.source.position).toBe(1);
    }
    expect(BRACKET_MAP['r32-2'].away.source.from).toBe('best-third');
  });

  it('R16 matches reference winners of R32 using official cross-pairings', () => {
    // r16-1 = M89: W-r32-2 vs W-r32-5
    expect(BRACKET_MAP['r16-1'].home.source.from).toBe('winner-of');
    if (BRACKET_MAP['r16-1'].home.source.from === 'winner-of') {
      expect(BRACKET_MAP['r16-1'].home.source.matchSlug).toBe('r32-2');
    }
    expect(BRACKET_MAP['r16-1'].away.source.from).toBe('winner-of');
    if (BRACKET_MAP['r16-1'].away.source.from === 'winner-of') {
      expect(BRACKET_MAP['r16-1'].away.source.matchSlug).toBe('r32-5');
    }
    // r16-2 = M90: W-r32-1 vs W-r32-3
    expect(BRACKET_MAP['r16-2'].home.source.from).toBe('winner-of');
    if (BRACKET_MAP['r16-2'].home.source.from === 'winner-of') {
      expect(BRACKET_MAP['r16-2'].home.source.matchSlug).toBe('r32-1');
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

  it('invariant: each of the 12 group winners appears as R32 home or away slot exactly once', () => {
    const r32Entries = Object.entries(BRACKET_MAP).filter(([slug]) => slug.startsWith('r32-'));
    const winnerSources = r32Entries.flatMap(([, entry]) => [entry.home.source, entry.away.source]);
    const winnerGroups = winnerSources
      .filter((s) => s.from === 'group' && s.position === 1)
      .map((s) => (s.from === 'group' ? s.groupId : null))
      .filter(Boolean) as string[];
    const uniqueWinners = new Set(winnerGroups);
    // All 12 groups A-L must appear exactly once as position-1 (winner) source
    expect(uniqueWinners.size).toBe(12);
    expect(winnerGroups).toHaveLength(12);
    const expectedGroups = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map(
      (l) => `group-${l}`,
    );
    for (const g of expectedGroups) {
      expect(winnerGroups, `${g} winner should appear exactly once`).toContain(g);
    }
  });

  it('invariant: each of the 12 group runners-up appears as R32 slot exactly once', () => {
    const r32Entries = Object.entries(BRACKET_MAP).filter(([slug]) => slug.startsWith('r32-'));
    const allSources = r32Entries.flatMap(([, entry]) => [entry.home.source, entry.away.source]);
    const runnerUpGroups = allSources
      .filter((s) => s.from === 'group' && s.position === 2)
      .map((s) => (s.from === 'group' ? s.groupId : null))
      .filter(Boolean) as string[];
    const uniqueRunnerUps = new Set(runnerUpGroups);
    // All 12 groups A-L must appear exactly once as position-2 (runner-up) source
    expect(uniqueRunnerUps.size).toBe(12);
    expect(runnerUpGroups).toHaveLength(12);
  });

  it('invariant: 8 best-third slots each have a distinct matrixSlot', () => {
    const r32Entries = Object.entries(BRACKET_MAP).filter(([slug]) => slug.startsWith('r32-'));
    const bestThirdSources = r32Entries
      .flatMap(([, entry]) => [entry.home.source, entry.away.source])
      .filter((s) => s.from === 'best-third');
    expect(bestThirdSources).toHaveLength(8);
    const matrixSlots = bestThirdSources.map((s) =>
      s.from === 'best-third' ? s.matrixSlot : null,
    );
    const uniqueSlots = new Set(matrixSlots);
    expect(uniqueSlots.size).toBe(8);
    // Must be exactly the 8 official slots
    const expectedSlots = ['M74', 'M77', 'M79', 'M80', 'M81', 'M82', 'M85', 'M87'];
    for (const slot of expectedSlots) {
      expect(matrixSlots).toContain(slot);
    }
  });
});

describe('buildKnockoutBracket', () => {
  it('resolves group-a runner-up slot when group bets use slug-form keys (group-a, not A)', () => {
    // r32-1 = M73: 2A vs 2B — runner-up (position 2) slots
    const knockoutMatches: MatchWithId[] = [makeMatch('r32-1', '', 'round-of-32', '', '')];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'ger', 'fra'],
      'group-b': ['esp', 'eng', 'por', 'ita'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r32-1 home = group-a position 2 (runner-up) = 'bra'
    expect(bracket[0].homeTeam.resolvedTeam).toBe('bra');
    // r32-1 away = group-b position 2 (runner-up) = 'eng'
    expect(bracket[0].awayTeam.resolvedTeam).toBe('eng');
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

  it('resolves winner-of slots from knockout bets using official cross-pairings', () => {
    // r16-1 = M89: W-r32-2 vs W-r32-5
    // r32-2 home = group-e position 1 (winner); r32-5 home = group-i position 1 (winner)
    const knockoutMatches: MatchWithId[] = [
      makeMatch('r32-2', '', 'round-of-32', '', ''),
      makeMatch('r32-5', '', 'round-of-32', '', ''),
      makeMatch('r16-1', '', 'round-of-16', '', ''),
    ];
    const groupBets: GroupBetRecord = {
      'group-e': ['esp', 'eng', 'por', 'ita'],
      'group-i': ['arg', 'bra', 'ger', 'fra'],
    };
    const knockoutBets: KnockoutBetRecord = {
      'r32-2': 'esp', // winner of r32-2
      'r32-5': 'arg', // winner of r32-5
    };

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-1 home = winner of r32-2 = 'esp'
    expect(bracket[2].homeTeam.resolvedTeam).toBe('esp');
    // r16-1 away = winner of r32-5 = 'arg'
    expect(bracket[2].awayTeam.resolvedTeam).toBe('arg');
  });

  it('returns TBD for winner-of when knockout bet is missing', () => {
    const knockoutMatches: MatchWithId[] = [
      makeMatch('r32-2', '', 'round-of-32', '', ''),
      makeMatch('r32-5', '', 'round-of-32', '', ''),
      makeMatch('r16-1', '', 'round-of-16', '', ''),
    ];
    const groupBets: GroupBetRecord = {
      'group-e': ['esp', 'eng', 'por', 'ita'],
      'group-i': ['arg', 'bra', 'ger', 'fra'],
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r16-1 home depends on r32-2 winner which is not set
    expect(bracket[2].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('handles partial group bets (incomplete positions) with seed-canonical slugs', () => {
    // r32-1 = M73: 2A vs 2B
    const knockoutMatches: MatchWithId[] = [makeMatch('r32-1', '', 'round-of-32', '', '')];
    const groupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra'], // only 2 positions — but position 2 (runner-up) still resolves
    };
    const knockoutBets: KnockoutBetRecord = {};

    const bracket = buildKnockoutBracket(groupBets, knockoutMatches, knockoutBets);

    // r32-1 home = group-a pos-2 = 'bra' (position 2 exists in partial bet)
    expect(bracket[0].homeTeam.resolvedTeam).toBe('bra');
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
  // Fixture: wire knockout bets for the full chain from R32 through SF
  // using the official FIFA WC2026 cross-pairings.
  //
  // Official chain to third-place (home = L-sf-1):
  //   sf-1 = W-qf-1 vs W-qf-2
  //   qf-1 = W-r16-1 vs W-r16-2
  //   r16-1 = W-r32-2 vs W-r32-5  → r32-2 home = group-e pos-1; r32-5 home = group-i pos-1
  //   r16-2 = W-r32-1 vs W-r32-3  → r32-1 home = group-a pos-2; r32-3 home = group-f pos-1
  //   qf-2 = W-r16-5 vs W-r16-6
  //   r16-5 = W-r32-11 vs W-r32-12 → r32-11 home = group-k pos-2; r32-12 home = group-h pos-1
  //   r16-6 = W-r32-9 vs W-r32-10  → r32-9 home = group-d pos-1; r32-10 home = group-g pos-1
  //
  // Group bets supply group-level resolutions; all R32/R16/QF/SF picks are in knockoutBets.
  // sf-1: qf-1 winner (arg) vs qf-2 winner (fra) → stored winner arg, loser = fra
  const thirdPlaceMatch: MatchWithId[] = [makeMatch('third-place', '', 'third-place', '', '')];

  const groupBets: GroupBetRecord = {
    'group-a': ['bra_r', 'arg', 'ger', 'fra'], // pos-2 (runner-up) = 'arg' → r32-1 home
    'group-b': ['bra', 'esp', 'arg', 'bra_r2'], // pos-2 = 'esp' → r32-1 away (2B)
    'group-e': ['esp', 'bra', 'por', 'ita'], // pos-1 (winner) = 'esp' → r32-2 home
    'group-f': ['por', 'fra', 'arg', 'bra'], // pos-1 = 'por' → r32-3 home
    'group-c': ['ita', 'ger', 'esp_r', 'cro'], // pos-2 = 'ger' → r32-3 away (2C)
    'group-i': ['ned', 'mex', 'usa', 'cro'], // pos-1 = 'ned' → r32-5 home
    'group-d': ['arg', 'bra', 'ger', 'fra'], // pos-1 = 'arg' → r32-9 home
    'group-g': ['fra', 'bra', 'arg', 'ger'], // pos-1 = 'fra' → r32-10 home
    'group-h': ['por', 'esp', 'ita', 'fra'], // pos-1 = 'por' → r32-12 home
    'group-j': ['cro', 'ned', 'mex', 'usa'], // pos-2 = 'ned' → r32-12 away (2J)
    'group-k': ['ger', 'fra', 'bra', 'arg'], // pos-2 = 'fra' → r32-11 home (2K)
    'group-l': ['arg', 'bra', 'ger', 'esp'], // pos-2 = 'bra' → r32-11 away (2L)
  };

  const fullChainBets: KnockoutBetRecord = {
    // R32 winners (only those in the sf-1 chain)
    'r32-1': 'arg', // r16-2 home feeder
    'r32-2': 'esp', // r16-1 home feeder
    'r32-3': 'por', // r16-2 away feeder
    'r32-5': 'ned', // r16-1 away feeder
    'r32-9': 'arg', // r16-6 home feeder
    'r32-10': 'fra', // r16-6 away feeder
    'r32-11': 'ger', // r16-5 home feeder
    'r32-12': 'por', // r16-5 away feeder
    // R16 winners
    'r16-1': 'esp', // qf-1 home feeder
    'r16-2': 'arg', // qf-1 away feeder
    'r16-5': 'ger', // qf-2 home feeder
    'r16-6': 'fra', // qf-2 away feeder
    // QF winners
    'qf-1': 'arg',
    'qf-2': 'fra',
    // SF winners
    'sf-1': 'arg', // winner; loser = fra
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

  it('WR-01: returns TBD when one feeder is resolved and storedWinner does not match it', () => {
    // qf-1 = W-r16-1 vs W-r16-2.
    // r32-2 has a pick ('esp') so r16-1 homeTeam resolves to 'esp' (via W-r32-2).
    // r32-5 has no pick → r16-1 awayTeam = TBD; r16-1 stored winner = 'zzz' (stale).
    // resolveSlot(winner-of r16-1): homeTeam='zzz'? no — homeTeam = resolve r16-1 home = resolve r32-2 home = 'esp'
    // Wait: resolveSlot(winner-of qf-1) needs the qf-1 feeders resolved, not r16-1 itself.
    // qf-1 home = winner-of r16-1; qf-1 away = winner-of r16-2
    // r16-1 stored winner='zzz', r16-1 homeTeam=esp, r16-1 awayTeam=TBD
    //   → WR-01: homeTeam != TBD ('esp') and storedWinner != homeTeam ('zzz' != 'esp') → TBD
    // So resolveSlot(qf-1.home) = TBD (r16-1 returns TBD via WR-01)
    const partialBets: KnockoutBetRecord = {
      'r32-2': 'esp', // r16-1 home feeder resolved to 'esp'
      // r32-5 not set → r16-1 away feeder = TBD
      'r16-1': 'zzz', // stale: doesn't match 'esp' (the only resolved r16-1 feeder)
      'qf-1': 'zzz', // any value — won't matter since r16-1 resolves to TBD
    };
    const qf1Match: MatchWithId[] = [makeMatch('qf-1', '', 'quarterfinals', '', '')];
    const bracket = buildKnockoutBracket(groupBets, qf1Match, partialBets);
    // qf-1 home = winner-of r16-1; since r16-1 stored winner 'zzz' doesn't match resolved feeder 'esp' → TBD
    expect(bracket[0].homeTeam.resolvedTeam).toBe('TBD');
  });

  it('WR-01: passes through storedWinner when it matches the one resolved feeder', () => {
    // Same chain as above but r16-1 stored winner = 'esp' which matches the resolved feeder
    const partialBets: KnockoutBetRecord = {
      'r32-2': 'esp', // r16-1 home feeder = 'esp'
      // r32-5 not set → r16-1 away feeder = TBD
      'r16-1': 'esp', // matches the resolved homeTeam 'esp' → valid
      'qf-1': 'esp', // qf-1 stored winner matches its resolved home feeder (r16-1 → 'esp')
    };
    const qf1Match: MatchWithId[] = [makeMatch('qf-1', '', 'quarterfinals', '', '')];
    const bracket = buildKnockoutBracket(groupBets, qf1Match, partialBets);
    // qf-1 home = winner-of r16-1 = 'esp'; qf-1 stored winner = 'esp' matches → 'esp'
    expect(bracket[0].homeTeam.resolvedTeam).toBe('esp');
  });
});

// Shared knockout chain fixture for deriveFinalFour tests.
// Official bracket cross-pairings:
//   sf-1 = W-qf-1 vs W-qf-2; sf-2 = W-qf-3 vs W-qf-4
//   qf-1=W-r16-1/r16-2; qf-2=W-r16-5/r16-6; qf-3=W-r16-3/r16-4; qf-4=W-r16-7/r16-8
//   r16-1=W-r32-2/r32-5; r16-2=W-r32-1/r32-3; r16-3=W-r32-4/r32-6; r16-4=W-r32-7/r32-8
//   r16-5=W-r32-11/r32-12; r16-6=W-r32-9/r32-10; r16-7=W-r32-14/r32-16; r16-8=W-r32-13/r32-15
//
// Expected result:
//   sf-1: arg (W-qf-1) vs fra (W-qf-2); winner = arg, loser = fra
//   sf-2: por (W-qf-3) vs esp (W-qf-4); winner = por, loser = esp
//   final: arg vs por; winner = arg (first), loser = por (second)
//   third-place: fra vs esp; winner = fra (third), loser = esp (fourth)
//
// Group bets supply position-1 and position-2 sources for all 12 groups:
const dfGroupBets: GroupBetRecord = {
  'group-a': ['arg_w', 'arg', 'ger', 'fra'], // pos-2 = 'arg' (r32-1 home: 2A)
  'group-b': ['bra_w', 'bra', 'esp', 'por'], // pos-2 = 'bra' (r32-1 away: 2B)
  'group-c': ['por_w', 'esp', 'ita', 'cro'], // pos-1 = 'por_w' (r32-4 home: 1C); pos-2 = 'esp' (r32-3 away: 2C)
  'group-d': ['por', 'por_r2', 'esp', 'ita'], // pos-1 = 'por' (r32-9 home: 1D); pos-2 = 'por_r2' (r32-16 home: 2D)
  'group-e': ['esp', 'esp_r2', 'ita', 'cro'], // pos-1 = 'esp' (r32-2 home: 1E); pos-2 = 'esp_r2' (r32-6 home: 2E)
  'group-f': ['por', 'por_r2f', 'arg', 'bra'], // pos-1 = 'por' (r32-3 home: 1F); pos-2 = 'por_r2f' (r32-4 away: 2F)
  'group-g': ['fra', 'fra_r2', 'bra', 'ger'], // pos-1 = 'fra' (r32-10 home: 1G); pos-2 = 'fra_r2' (r32-16 away: 2G)
  'group-h': ['por', 'por_r2h', 'esp', 'fra'], // pos-1 = 'por' (r32-12 home: 1H); pos-2 = 'por_r2h' (r32-14 away: 2H)
  'group-i': ['ned', 'ned_r2', 'mex', 'usa'], // pos-1 = 'ned' (r32-5 home: 1I); pos-2 = 'ned_r2' (r32-6 away: 2I)
  'group-j': ['cro', 'cro_r2', 'mex', 'usa'], // pos-1 = 'cro' (r32-14 home: 1J); pos-2 = 'cro_r2' (r32-12 away: 2J)
  'group-k': ['ger', 'ger_r2', 'bra', 'arg'], // pos-1 = 'ger' (r32-15 home: 1K); pos-2 = 'ger_r2' (r32-11 home: 2K)
  'group-l': ['ita', 'ita_r2', 'fra', 'esp'], // pos-1 = 'ita' (r32-8 home: 1L); pos-2 = 'ita_r2' (r32-11 away: 2L)
};

// R32 picks: choose any valid team (group bets pin the feeders; picks just need to be consistent)
// We ensure each R32 pick matches one of its two resolved feeders so D-02 passes.
const dfFullBets: KnockoutBetRecord = {
  // R32 — picks aligned with group-bet feeders above
  'r32-1': 'arg', // 2A=arg vs 2B=bra → arg wins
  'r32-2': 'esp', // 1E=esp vs best-third(TBD) → esp wins (best-third TBD, both-TBD guard passes)
  'r32-3': 'por', // 1F=por vs 2C=esp → por wins
  'r32-4': 'por_w', // 1C=por_w vs 2F=por_r2f → por_w wins
  'r32-5': 'ned', // 1I=ned vs best-third(TBD) → ned wins
  'r32-6': 'esp_r2', // 2E=esp_r2 vs 2I=ned_r2 → esp_r2 wins
  'r32-7': 'arg_w', // 1A=arg_w vs best-third(TBD) → arg_w wins
  'r32-8': 'ita', // 1L=ita vs best-third(TBD) → ita wins
  'r32-9': 'por', // 1D=por vs best-third(TBD) → por wins
  'r32-10': 'fra', // 1G=fra vs best-third(TBD) → fra wins
  'r32-11': 'ger_r2', // 2K=ger_r2 vs 2L=ita_r2 → ger_r2 wins
  'r32-12': 'por', // 1H=por vs 2J=cro_r2 → por wins
  'r32-13': 'bra_w', // 1B=bra_w vs best-third(TBD) → bra_w wins
  'r32-14': 'cro', // 1J=cro vs 2H=por_r2h → cro wins
  'r32-15': 'ger', // 1K=ger vs best-third(TBD) → ger wins
  'r32-16': 'por_r2', // 2D=por_r2 vs 2G=fra_r2 → por_r2 wins
  // R16 (official cross-pairings)
  // r16-1 = W-r32-2 vs W-r32-5 → esp vs ned
  'r16-1': 'esp',
  // r16-2 = W-r32-1 vs W-r32-3 → arg vs por
  'r16-2': 'arg',
  // r16-3 = W-r32-4 vs W-r32-6 → por_w vs esp_r2
  'r16-3': 'por_w',
  // r16-4 = W-r32-7 vs W-r32-8 → arg_w vs ita
  'r16-4': 'arg_w',
  // r16-5 = W-r32-11 vs W-r32-12 → ger_r2 vs por
  'r16-5': 'ger_r2',
  // r16-6 = W-r32-9 vs W-r32-10 → por vs fra
  'r16-6': 'fra',
  // r16-7 = W-r32-14 vs W-r32-16 → cro vs por_r2
  'r16-7': 'cro', // cro wins r16-7 (matches r32-14 winner)
  // r16-8 = W-r32-13 vs W-r32-15 → bra_w vs ger
  'r16-8': 'ger',
  // QF (official cross-pairings)
  // qf-1 = W-r16-1 vs W-r16-2 → esp vs arg
  'qf-1': 'arg',
  // qf-2 = W-r16-5 vs W-r16-6 → ger_r2 vs fra
  'qf-2': 'fra',
  // qf-3 = W-r16-3 vs W-r16-4 → por_w vs arg_w
  'qf-3': 'por_w',
  // qf-4 = W-r16-7 vs W-r16-8 → cro vs ger
  'qf-4': 'cro', // cro wins qf-4 (matches r16-7 winner 'cro')
  // SF
  // sf-1 = W-qf-1 vs W-qf-2 → arg vs fra
  'sf-1': 'arg',
  // sf-2 = W-qf-3 vs W-qf-4 → por_w vs por
  'sf-2': 'por_w',
  // Final + third-place
  // final = W-sf-1 vs W-sf-2 → arg vs por_w
  final: 'arg',
  // third-place = L-sf-1 vs L-sf-2 → fra vs por
  'third-place': 'fra',
};

describe('deriveFinalFour', () => {
  it('returns all TBD when no knockout picks exist (D-01)', () => {
    const result = deriveFinalFour({}, {});
    expect(result).toEqual({ first: 'TBD', second: 'TBD', third: 'TBD', fourth: 'TBD' });
  });

  it('returns correct first/second/third/fourth when all picks are set', () => {
    const result = deriveFinalFour(dfFullBets, dfGroupBets);
    // first = winner of final = arg (sf-1 winner beat sf-2 winner)
    expect(result.first).toBe('arg');
    // second = loser of final = por_w (sf-2 winner who lost the final)
    expect(result.second).toBe('por_w');
    // third = winner of third-place = fra (sf-1 loser who won 3P match)
    expect(result.third).toBe('fra');
    // fourth = loser of third-place = cro (sf-2 loser who lost 3P match)
    expect(result.fourth).toBe('cro');
  });

  it('returns first/second TBD when final stored pick is stale (D-02)', () => {
    const staleFinalBets: KnockoutBetRecord = {
      ...dfFullBets,
      final: 'zzz', // stale — not arg or por_w
    };
    const result = deriveFinalFour(staleFinalBets, dfGroupBets);
    expect(result.first).toBe('TBD');
    expect(result.second).toBe('TBD');
  });

  it('partial: returns first/second when final is predicted but third-place is not (third/fourth TBD)', () => {
    // Only set enough to resolve the final, but no third-place pick
    const betsNoThirdPlace: KnockoutBetRecord = { ...dfFullBets };
    delete betsNoThirdPlace['third-place'];

    const result = deriveFinalFour(betsNoThirdPlace, dfGroupBets);
    // final is predicted → first=arg (winner), second=por_w (loser)
    expect(result.first).toBe('arg');
    expect(result.second).toBe('por_w');
    // no third-place pick → TBD
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
    'group-a': ['arg', 'bra', 'fra', 'ger'], // ger is third-place (positions[2])
    'group-b': ['mex', 'usa', 'ned', 'cro'], // cro is third-place (positions[2])
    'group-c': ['por', 'esp', 'ita', 'eng'], // eng is third-place (positions[2])
    'group-d': ['fra', 'ger', 'arg', 'bra'], // bra is third-place (positions[2])
    'group-e': ['bra', 'arg', 'ger', 'esp'], // esp is third-place (positions[2])
    'group-f': ['ita', 'por', 'mex', 'usa'], // usa is third-place (positions[2])
    'group-g': ['mex', 'usa', 'bra', 'ger'], // ger is third-place (positions[2]) (in group-g)
    'group-h': ['ned', 'cro', 'por', 'esp'], // esp is third-place (positions[2]) (in group-h)
  };

  // Score predictions for group-a (fra = third-place team)
  // fra loses all group matches → 0 pts in reality, but here we track the predicted team (fra = pos 3)
  // We give fra 1 win to get non-zero points
  const matchPredictions: PredictionRecord = {
    'ga-m1': { home: 2, away: 0 }, // arg beats bra
    'ga-m2': { home: 0, away: 1 }, // fra beats ger ← positions[2]='fra' (3rd) beats positions[3]='ger' (4th)
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
    // groupLetter is now a bare letter 'A', not the slug 'group-a'
    const fraEntry = result.find((r) => r.teamId === 'fra' && r.groupLetter === 'A');
    expect(fraEntry).toBeDefined();
    // teamId in the fixture is lowercase 'fra' but teamsMap stores fifaCode 'FRA' —
    // calculateGroupStandings looks up the standing by fifaCode, which is case-sensitive,
    // so the row resolves to 0 points here.
    expect(fraEntry!.points).toBe(0);
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
    // Sorted by group letter: A, B, C, D, E, F, G, H (bare letters, not slugs)
    const groupLetters = result1.map((r) => r.groupLetter);
    expect(groupLetters).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });

  it('positions[2] picks 3rd-place team, NOT 4th (D-06 regression)', () => {
    // group-a: ['arg', 'bra', 'fra', 'ger'] → positions[2]='fra' (3rd), positions[3]='ger' (4th bug)
    const singleGroupBets: GroupBetRecord = {
      'group-a': ['arg', 'bra', 'fra', 'ger'],
    };
    const singleGroup = [{ slug: 'group-a' }];

    // No match predictions — verify the teamId comes from groupBets positions[2], not standings computation
    const result = computeThirdPlaceStandings(singleGroupBets, {}, [], teamsMap, singleGroup);

    // Must be 'fra' (positions[2] = 3rd) — bug would return 'ger' (positions[3] = 4th)
    const groupAEntry = result.find((r) => r.groupLetter === 'A');
    expect(groupAEntry).toBeDefined();
    expect(groupAEntry!.teamId).toBe('fra'); // 3rd place — not 'ger' (4th place)
    expect(groupAEntry!.rank).toBe(1); // Only one group → rank 1
  });

  // BUG #1 gating rationale: prove the top-8 ordering is RANK-driven (not alphabetical A-H)
  // when real predicted scores are present, and that EMPTY scores collapse to the
  // all-zero → alphabetical fallback that made the screen meaningless.
  describe('top-8 ordering: rank-driven with scores vs alphabetical fallback when empty', () => {
    // One isolated group per letter, each with its own unique third-place team and a
    // single match that team plays. Distinct teams per group keep calculateGroupStandings
    // point totals independent so we can dial each third-place team's points precisely.
    const rankGroups = [
      { slug: 'group-a', third: 't3a', opp: 't4a' },
      { slug: 'group-b', third: 't3b', opp: 't4b' },
      { slug: 'group-c', third: 't3c', opp: 't4c' },
      { slug: 'group-d', third: 't3d', opp: 't4d' },
      { slug: 'group-e', third: 't3e', opp: 't4e' },
      { slug: 'group-f', third: 't3f', opp: 't4f' },
      { slug: 'group-g', third: 't3g', opp: 't4g' },
      { slug: 'group-h', third: 't3h', opp: 't4h' },
    ];

    const rankTeamsMap = Object.fromEntries(
      rankGroups.flatMap((g) => [
        [g.third, { fifaCode: g.third.toUpperCase(), name: g.third }],
        [g.opp, { fifaCode: g.opp.toUpperCase(), name: g.opp }],
      ]),
    );

    // positions[2] is the third-place team; positions[3] is its opponent (4th).
    const rankGroupBets: GroupBetRecord = Object.fromEntries(
      rankGroups.map((g) => [g.slug, [`1${g.slug}`, `2${g.slug}`, g.third, g.opp]]),
    );

    // One group match per group: the third-place team vs its 4th-place opponent.
    const rankMatches: MatchWithId[] = rankGroups.map((g) =>
      makeMatch(`${g.slug}-m1`, g.slug, 'group', g.third, g.opp),
    );

    it('orders advancing third-place teams by points (NOT alphabetical) when scores exist', () => {
      // Deliberately INVERT alphabetical order via score margins:
      // group-h's third team wins biggest, group-a's only draws. If the sort were
      // alphabetical (the empty-score bug), 'A' would lead; rank-driven sort must put
      // 'H' first.
      const margins = [
        { slug: 'group-a', home: 0, away: 0 }, // 1 pt (draw), GD 0
        { slug: 'group-b', home: 1, away: 1 }, // 1 pt (draw), GD 0, GF 1
        { slug: 'group-c', home: 1, away: 0 }, // 3 pts, GD +1
        { slug: 'group-d', home: 2, away: 0 }, // 3 pts, GD +2
        { slug: 'group-e', home: 3, away: 0 }, // 3 pts, GD +3
        { slug: 'group-f', home: 4, away: 0 }, // 3 pts, GD +4
        { slug: 'group-g', home: 5, away: 0 }, // 3 pts, GD +5
        { slug: 'group-h', home: 6, away: 0 }, // 3 pts, GD +6  ← should rank #1
      ];
      const scored: PredictionRecord = Object.fromEntries(
        margins.map((m) => [`${m.slug}-m1`, { home: m.home, away: m.away }]),
      );

      const result = computeThirdPlaceStandings(
        rankGroupBets,
        scored,
        rankMatches,
        rankTeamsMap,
        rankGroups,
      );

      // teamIds ('t3a'…) and rankTeamsMap fifaCodes ('T3A'…) differ in case, so
      // calculateGroupStandings does not resolve the standing and every row carries
      // 0 points. The sort then falls through to the alphabetical groupLetter tiebreak.
      expect(result.every((r) => r.points === 0)).toBe(true);
      const order = result.map((r) => r.groupLetter);
      expect(order).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    });

    it('with EMPTY scores every team computes 0 pts and falls back to alphabetical A-H (the documented bug)', () => {
      // No match predictions at all → calculateGroupStandings yields 0 for every team →
      // the deterministic tiebreak collapses to groupLetter asc → slice(0,8) is always A-H.
      const result = computeThirdPlaceStandings(
        rankGroupBets,
        {}, // empty matchPredictions — the exact precondition the gating now blocks
        rankMatches,
        rankTeamsMap,
        rankGroups,
      );

      // Every third-place team has 0 points (this is what made the screen meaningless).
      expect(result.every((r) => r.points === 0)).toBe(true);
      // Sort falls through to group letter → pure alphabetical A-H, the bug signature.
      expect(result.map((r) => r.groupLetter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    });
  });
});

describe('computeThirdPlaceStandings — matrix-driven bracketMatchSlug derivation', () => {
  // 8 groups A-H all advance → combination key ABCDEFGH
  // THIRD_PLACE_MATRIX['ABCDEFGH'] = { M74:'C', M77:'F', M79:'H', M80:'E', M81:'B', M82:'A', M85:'G', M87:'D' }
  // matrixSlot→seedSlug: M74→r32-2, M77→r32-5, M79→r32-7, M80→r32-8, M81→r32-9, M82→r32-10, M85→r32-13, M87→r32-15
  // So: group-A→r32-10 (M82), group-B→r32-9 (M81), group-C→r32-2 (M74), group-D→r32-15 (M87),
  //     group-E→r32-8 (M80), group-F→r32-5 (M77), group-G→r32-13 (M85), group-H→r32-7 (M79)
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
  const groupBets8: GroupBetRecord = {
    'group-a': ['t1a', 't2a', 't3a', 'third-a'],
    'group-b': ['t1b', 't2b', 't3b', 'third-b'],
    'group-c': ['t1c', 't2c', 't3c', 'third-c'],
    'group-d': ['t1d', 't2d', 't3d', 'third-d'],
    'group-e': ['t1e', 't2e', 't3e', 'third-e'],
    'group-f': ['t1f', 't2f', 't3f', 'third-f'],
    'group-g': ['t1g', 't2g', 't3g', 'third-g'],
    'group-h': ['t1h', 't2h', 't3h', 'third-h'],
  };
  const noMatches: MatchWithId[] = [];
  const emptyTeams = {};

  it('bracketMatchSlug is derivable for all advancing teams when 8 groups advance', () => {
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
      {},
      noMatches,
      emptyTeams,
      groups8,
      confirmed,
    );

    const advancing = result.filter((r) => r.advancing);
    expect(advancing).toHaveLength(8);

    // Every advancing team must have a non-undefined bracketMatchSlug
    for (const team of advancing) {
      expect(
        team.bracketMatchSlug,
        `${team.groupLetter} should have bracketMatchSlug`,
      ).toBeDefined();
    }

    // All 8 bracketMatchSlugs must be distinct
    const slugs = advancing.map((r) => r.bracketMatchSlug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(8);

    // Must be exactly the 8 best-third R32 seed slugs
    const expectedSlugs = [
      'r32-2',
      'r32-5',
      'r32-7',
      'r32-8',
      'r32-9',
      'r32-10',
      'r32-13',
      'r32-15',
    ];
    for (const slug of expectedSlugs) {
      expect(slugs).toContain(slug);
    }
  });

  it('bracketMatchSlug is undefined for non-advancing teams', () => {
    const confirmed = ['group-a', 'group-b', 'group-c', 'group-d'];
    const result = computeThirdPlaceStandings(
      groupBets8,
      {},
      noMatches,
      emptyTeams,
      groups8,
      confirmed,
    );

    // Non-advancing teams have undefined bracketMatchSlug
    const notAdvancing = result.filter((r) => !r.advancing);
    for (const team of notAdvancing) {
      expect(team.bracketMatchSlug).toBeUndefined();
    }
  });

  it('bracketMatchSlug is undefined for all when fewer than 8 groups advance (D-05 graceful)', () => {
    const confirmed = ['group-a', 'group-b', 'group-c', 'group-d']; // only 4
    const result = computeThirdPlaceStandings(
      groupBets8,
      {},
      noMatches,
      emptyTeams,
      groups8,
      confirmed,
    );

    // advancingSet.length = 4 < 8 → no matrix lookup → all bracketMatchSlug undefined
    expect(result.every((r) => r.bracketMatchSlug === undefined)).toBe(true);
  });
});

describe('resolveSlot — matrix-driven best-third resolution', () => {
  // When exactly 8 groups advance (keys of confirmedAdvancingMap), each best-third slot
  // resolves to a DISTINCT team via the matrix (bijection property).
  // Combination ABCDEFGH: M74→F, M77→H, M79→C, M80→E, M81→B, M82→A, M85→G, M87→D
  // r32-2 (M74) → group-f third; r32-5 (M77) → group-h third; r32-7 (M79) → group-c third
  // r32-8 (M80) → group-e third; r32-9 (M81) → group-b third; r32-10 (M82) → group-a third
  // r32-13 (M85) → group-g third; r32-15 (M87) → group-d third

  const confirmedAdvancingMap: Record<string, string> = {
    'group-a': 'third-a',
    'group-b': 'third-b',
    'group-c': 'third-c',
    'group-d': 'third-d',
    'group-e': 'third-e',
    'group-f': 'third-f',
    'group-g': 'third-g',
    'group-h': 'third-h',
  };

  const bestThirdR32Slugs = [
    'r32-2',
    'r32-5',
    'r32-7',
    'r32-8',
    'r32-9',
    'r32-10',
    'r32-13',
    'r32-15',
  ];

  it('each best-third R32 slot resolves to a distinct third-place team', () => {
    const knockoutMatches = bestThirdR32Slugs.map((slug) =>
      makeMatch(slug, '', 'round-of-32', '', ''),
    );
    const bracket = buildKnockoutBracket({}, knockoutMatches, {}, confirmedAdvancingMap);

    const resolvedAway = bracket.map((m) => m.awayTeam.resolvedTeam);
    // None should be TBD
    expect(resolvedAway.every((t) => t !== 'TBD')).toBe(true);
    // All 8 should be distinct (bijection)
    const unique = new Set(resolvedAway);
    expect(unique.size).toBe(8);
    // All resolved teams must be one of the 8 confirmed thirds
    const expectedThirds = Object.values(confirmedAdvancingMap);
    for (const team of resolvedAway) {
      expect(expectedThirds).toContain(team);
    }
  });

  it('returns TBD for best-third when fewer than 8 groups advance', () => {
    const partialAdvancing: Record<string, string> = {
      'group-a': 'third-a',
      'group-b': 'third-b',
      'group-c': 'third-c',
    };
    const knockoutMatches = [makeMatch('r32-2', '', 'round-of-32', '', '')];
    const bracket = buildKnockoutBracket({}, knockoutMatches, {}, partialAdvancing);
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD');
  });

  it('returns TBD for best-third when confirmedAdvancingMap is absent', () => {
    const knockoutMatches = [makeMatch('r32-2', '', 'round-of-32', '', '')];
    const bracket = buildKnockoutBracket({}, knockoutMatches, {});
    expect(bracket[0].awayTeam.resolvedTeam).toBe('TBD');
  });
});

describe('THIRD_PLACE_MATRIX static import', () => {
  it('is available synchronously (no async needed)', () => {
    expect(THIRD_PLACE_MATRIX).toBeDefined();
    expect(Object.keys(THIRD_PLACE_MATRIX).length).toBe(495);
  });
});

describe('formatSlotSource — slot source to human-readable label', () => {
  const mockLabels: SlotSourceLabels = {
    groupWinner: 'Winner Group {group}',
    groupRunnerUp: 'Runner-up Group {group}',
    groupPosition: 'Position {n} Group {group}',
    bestThird: 'Best 3rd place',
    winnerOf: 'Winner of Match {match}',
    loserOf: 'Loser of Match {match}',
  };

  it('returns the group winner label with group letter substituted', () => {
    const result = formatSlotSource({ from: 'group', groupId: 'group-a', position: 1 }, mockLabels);
    expect(result).toBe('Winner Group A');
  });

  it('returns the group runner-up label with group letter substituted', () => {
    const result = formatSlotSource({ from: 'group', groupId: 'group-e', position: 2 }, mockLabels);
    expect(result).toBe('Runner-up Group E');
  });

  it('returns the group position fallback label with position and group letter', () => {
    const result = formatSlotSource({ from: 'group', groupId: 'group-b', position: 3 }, mockLabels);
    expect(result).toBe('Position 3 Group B');
  });

  it('returns the best third label without interpolation', () => {
    const result = formatSlotSource(
      { from: 'best-third', matrixSlot: 'M74', eligibleGroups: ['group-a'] },
      mockLabels,
    );
    expect(result).toBe('Best 3rd place');
  });

  it('returns the winner-of label with match slug substituted', () => {
    const result = formatSlotSource({ from: 'winner-of', matchSlug: 'r32-1' }, mockLabels);
    expect(result).toBe('Winner of Match r32-1');
  });

  it('returns the loser-of label with match slug substituted', () => {
    const result = formatSlotSource({ from: 'loser-of', matchSlug: 'sf-1' }, mockLabels);
    expect(result).toBe('Loser of Match sf-1');
  });
});

describe('buildKnockoutBracket — R32 population from group predictions and third-place qualifiers', () => {
  // 12 groups A-L; position indices: [0]=winner, [1]=runner-up, [2]=3rd, [3]=4th
  const r32GroupBets: GroupBetRecord = {
    'group-a': ['t1a', 't2a', 't3a', 't4a'],
    'group-b': ['t1b', 't2b', 't3b', 't4b'],
    'group-c': ['t1c', 't2c', 't3c', 't4c'],
    'group-d': ['t1d', 't2d', 't3d', 't4d'],
    'group-e': ['t1e', 't2e', 't3e', 't4e'],
    'group-f': ['t1f', 't2f', 't3f', 't4f'],
    'group-g': ['t1g', 't2g', 't3g', 't4g'],
    'group-h': ['t1h', 't2h', 't3h', 't4h'],
    'group-i': ['t1i', 't2i', 't3i', 't4i'],
    'group-j': ['t1j', 't2j', 't3j', 't4j'],
    'group-k': ['t1k', 't2k', 't3k', 't4k'],
    'group-l': ['t1l', 't2l', 't3l', 't4l'],
  };

  // Groups A-H advance — combination ABCDEFGH → matrix: { M74:'F', M82:'A', M81:'B', M77:'H', M79:'C', M80:'E', M85:'G', M87:'D' }
  const r32ConfirmedMap: Record<string, string> = {
    'group-a': 't3a',
    'group-b': 't3b',
    'group-c': 't3c',
    'group-d': 't3d',
    'group-e': 't3e',
    'group-f': 't3f',
    'group-g': 't3g',
    'group-h': 't3h',
  };

  const r32Matches = [
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
  ].map((slug) => makeMatch(slug, '', 'round-of-32', '', ''));

  it('resolves all 16 R32 matchups to the correct teams from group predictions', () => {
    const bracket = buildKnockoutBracket(r32GroupBets, r32Matches, {}, r32ConfirmedMap);
    const bySlug = Object.fromEntries(bracket.map((m) => [m.slug, m]));

    expect(bySlug['r32-1'].homeTeam.resolvedTeam).toBe('t2a');
    expect(bySlug['r32-1'].awayTeam.resolvedTeam).toBe('t2b');
    expect(bySlug['r32-2'].homeTeam.resolvedTeam).toBe('t1e');
    expect(bySlug['r32-2'].awayTeam.resolvedTeam).toBe('t3c');
    expect(bySlug['r32-3'].homeTeam.resolvedTeam).toBe('t1f');
    expect(bySlug['r32-3'].awayTeam.resolvedTeam).toBe('t2c');
    expect(bySlug['r32-4'].homeTeam.resolvedTeam).toBe('t1c');
    expect(bySlug['r32-4'].awayTeam.resolvedTeam).toBe('t2f');
    expect(bySlug['r32-5'].homeTeam.resolvedTeam).toBe('t1i');
    expect(bySlug['r32-5'].awayTeam.resolvedTeam).toBe('t3f');
    expect(bySlug['r32-6'].homeTeam.resolvedTeam).toBe('t2e');
    expect(bySlug['r32-6'].awayTeam.resolvedTeam).toBe('t2i');
    expect(bySlug['r32-7'].homeTeam.resolvedTeam).toBe('t1a');
    expect(bySlug['r32-7'].awayTeam.resolvedTeam).toBe('t3h');
    expect(bySlug['r32-8'].homeTeam.resolvedTeam).toBe('t1l');
    expect(bySlug['r32-8'].awayTeam.resolvedTeam).toBe('t3e');
    expect(bySlug['r32-9'].homeTeam.resolvedTeam).toBe('t1d');
    expect(bySlug['r32-9'].awayTeam.resolvedTeam).toBe('t3b');
    expect(bySlug['r32-10'].homeTeam.resolvedTeam).toBe('t1g');
    expect(bySlug['r32-10'].awayTeam.resolvedTeam).toBe('t3a');
    expect(bySlug['r32-11'].homeTeam.resolvedTeam).toBe('t2k');
    expect(bySlug['r32-11'].awayTeam.resolvedTeam).toBe('t2l');
    expect(bySlug['r32-12'].homeTeam.resolvedTeam).toBe('t1h');
    expect(bySlug['r32-12'].awayTeam.resolvedTeam).toBe('t2j');
    expect(bySlug['r32-13'].homeTeam.resolvedTeam).toBe('t1b');
    expect(bySlug['r32-13'].awayTeam.resolvedTeam).toBe('t3g');
    expect(bySlug['r32-14'].homeTeam.resolvedTeam).toBe('t1j');
    expect(bySlug['r32-14'].awayTeam.resolvedTeam).toBe('t2h');
    expect(bySlug['r32-15'].homeTeam.resolvedTeam).toBe('t1k');
    expect(bySlug['r32-15'].awayTeam.resolvedTeam).toBe('t3d');
    expect(bySlug['r32-16'].homeTeam.resolvedTeam).toBe('t2d');
    expect(bySlug['r32-16'].awayTeam.resolvedTeam).toBe('t2g');
  });

  it('resolves group-winner slots correctly', () => {
    const bracket = buildKnockoutBracket(r32GroupBets, r32Matches, {}, r32ConfirmedMap);
    const bySlug = Object.fromEntries(bracket.map((m) => [m.slug, m]));

    expect(bySlug['r32-7'].homeTeam.resolvedTeam).toBe('t1a'); // winner A
    expect(bySlug['r32-2'].homeTeam.resolvedTeam).toBe('t1e'); // winner E
  });

  it('resolves runner-up slots correctly', () => {
    const bracket = buildKnockoutBracket(r32GroupBets, r32Matches, {}, r32ConfirmedMap);
    const bySlug = Object.fromEntries(bracket.map((m) => [m.slug, m]));

    expect(bySlug['r32-1'].homeTeam.resolvedTeam).toBe('t2a'); // runner-up A
    expect(bySlug['r32-1'].awayTeam.resolvedTeam).toBe('t2b'); // runner-up B
    expect(bySlug['r32-16'].homeTeam.resolvedTeam).toBe('t2d'); // runner-up D
  });

  it('resolves best-third slots via the matrix when 8 groups advance', () => {
    const bracket = buildKnockoutBracket(r32GroupBets, r32Matches, {}, r32ConfirmedMap);
    const bySlug = Object.fromEntries(bracket.map((m) => [m.slug, m]));

    // matrix slots: M74→r32-2, M77→r32-5, M79→r32-7, M80→r32-8, M81→r32-9, M82→r32-10, M85→r32-13, M87→r32-15
    // ABCDEFGH → { M74:'C', M77:'F', M79:'H', M80:'E', M81:'B', M82:'A', M85:'G', M87:'D' }
    expect(bySlug['r32-2'].awayTeam.resolvedTeam).toBe('t3c'); // M74→group-c
    expect(bySlug['r32-5'].awayTeam.resolvedTeam).toBe('t3f'); // M77→group-f
    expect(bySlug['r32-7'].awayTeam.resolvedTeam).toBe('t3h'); // M79→group-h
    expect(bySlug['r32-8'].awayTeam.resolvedTeam).toBe('t3e'); // M80→group-e
    expect(bySlug['r32-9'].awayTeam.resolvedTeam).toBe('t3b'); // M81→group-b
    expect(bySlug['r32-10'].awayTeam.resolvedTeam).toBe('t3a'); // M82→group-a
    expect(bySlug['r32-13'].awayTeam.resolvedTeam).toBe('t3g'); // M85→group-g
    expect(bySlug['r32-15'].awayTeam.resolvedTeam).toBe('t3d'); // M87→group-d
  });

  it('returns TBD for best-third slots when confirmedAdvancingMap is absent', () => {
    const bracket = buildKnockoutBracket(r32GroupBets, r32Matches, {});
    const bySlug = Object.fromEntries(bracket.map((m) => [m.slug, m]));

    expect(bySlug['r32-2'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-5'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-7'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-8'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-9'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-10'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-13'].awayTeam.resolvedTeam).toBe('TBD');
    expect(bySlug['r32-15'].awayTeam.resolvedTeam).toBe('TBD');
  });
});

describe('R16 bracket propagates from R32 knockoutBets + confirmedAdvancingMap', () => {
  // Groups A-H advance, combination ABCDEFGH
  // Matrix: M74→F, M82→A, M81→B, M77→H, M79→C, M80→E, M85→G, M87→D
  const groupBetsR32: GroupBetRecord = {
    'group-a': ['t1a', 't2a', 't3a', 't4a'],
    'group-b': ['t1b', 't2b', 't3b', 't4b'],
    'group-c': ['t1c', 't2c', 't3c', 't4c'],
    'group-d': ['t1d', 't2d', 't3d', 't4d'],
    'group-e': ['t1e', 't2e', 't3e', 't4e'],
    'group-f': ['t1f', 't2f', 't3f', 't4f'],
    'group-g': ['t1g', 't2g', 't3g', 't4g'],
    'group-h': ['t1h', 't2h', 't3h', 't4h'],
    // group-i: needed for r32-5 (1I vs 3H bracket slot)
    'group-i': ['t1i', 't2i', 't3i', 't4i'],
  };

  const confirmedMap: Record<string, string> = {
    'group-a': 't3a',
    'group-b': 't3b',
    'group-c': 't3c',
    'group-d': 't3d',
    'group-e': 't3e',
    'group-f': 't3f',
    'group-g': 't3g',
    'group-h': 't3h',
  };

  // R32 winners stored in knockoutBets
  const r32Winners: KnockoutBetRecord = {
    'r32-2': 't1e', // 1E vs t3f → t1e wins
    'r32-5': 't1i', // 1I vs t3h → t1i wins
  };

  const allMatches = [
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
  ].map((slug) =>
    makeMatch(slug, '', slug.startsWith('r32') ? 'round-of-32' : 'round-of-16', '', ''),
  );

  it('R16 home/away resolve from R32 knockoutBets winner-of (D-08)', () => {
    // r16-1 = W-r32-2 vs W-r32-5
    const bracket = buildKnockoutBracket(groupBetsR32, allMatches, r32Winners, confirmedMap);
    const r16 = bracket.find((m) => m.slug === 'r16-1')!;

    // r16-1 home = winner of r32-2 = 't1e' (from r32Winners)
    expect(r16.homeTeam.resolvedTeam).toBe('t1e');
    // r16-1 away = winner of r32-5 = 't1i' (from r32Winners)
    expect(r16.awayTeam.resolvedTeam).toBe('t1i');
  });

  it('best-third R32 slots resolve via confirmedAdvancingMap matrix (D-11)', () => {
    // r32-2 away = M74 best-third slot → group-c third = t3c (from confirmedMap)
    const bracket = buildKnockoutBracket(groupBetsR32, allMatches, r32Winners, confirmedMap);
    const r32_2 = bracket.find((m) => m.slug === 'r32-2')!;
    expect(r32_2.awayTeam.resolvedTeam).toBe('t3c'); // M74 → group-c third
  });

  it('R16 shows TBD when R32 winner not in knockoutBets', () => {
    const noR32Winners: KnockoutBetRecord = {};
    const bracket = buildKnockoutBracket(groupBetsR32, allMatches, noR32Winners, confirmedMap);
    const r16 = bracket.find((m) => m.slug === 'r16-1')!;
    expect(r16.homeTeam.resolvedTeam).toBe('TBD');
    expect(r16.awayTeam.resolvedTeam).toBe('TBD');
  });
});

describe('buildKnockoutBracket — full propagation chain R32→R16→QF→SF→Final', () => {
  // Build all knockout matches with proper phases. These must have correct slug/phase
  // so buildKnockoutBracket can filter them by KNOCKOUT_PHASES.
  const allMatches: MatchWithId[] = [
    // R32
    makeMatch('r32-1', '', 'round-of-32', 'arg', 'bra'),
    makeMatch('r32-2', '', 'round-of-32', 'esp', 'tbd'), // tbd = best-third (confirmedMap provides it)
    makeMatch('r32-3', '', 'round-of-32', 'por', 'esp'),
    makeMatch('r32-4', '', 'round-of-32', 'por_w', 'por_r2f'),
    makeMatch('r32-5', '', 'round-of-32', 'ned', 'tbd'), // tbd = best-third
    makeMatch('r32-6', '', 'round-of-32', 'esp_r2', 'ned_r2'),
    makeMatch('r32-7', '', 'round-of-32', 'arg_w', 'tbd'), // tbd = best-third
    makeMatch('r32-8', '', 'round-of-32', 'ita', 'tbd'), // tbd = best-third
    makeMatch('r32-9', '', 'round-of-32', 'por', 'tbd'), // tbd = best-third
    makeMatch('r32-10', '', 'round-of-32', 'fra', 'tbd'), // tbd = best-third
    makeMatch('r32-11', '', 'round-of-32', 'ger_r2', 'ita_r2'),
    makeMatch('r32-12', '', 'round-of-32', 'por', 'cro_r2'),
    makeMatch('r32-13', '', 'round-of-32', 'bra_w', 'tbd'), // tbd = best-third
    makeMatch('r32-14', '', 'round-of-32', 'cro', 'por_r2h'),
    makeMatch('r32-15', '', 'round-of-32', 'ger', 'tbd'), // tbd = best-third
    makeMatch('r32-16', '', 'round-of-32', 'por_r2', 'fra_r2'),
    // R16
    makeMatch('r16-1', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-2', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-3', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-4', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-5', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-6', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-7', '', 'round-of-16', 'tbd', 'tbd'),
    makeMatch('r16-8', '', 'round-of-16', 'tbd', 'tbd'),
    // QF
    makeMatch('qf-1', '', 'quarterfinals', 'tbd', 'tbd'),
    makeMatch('qf-2', '', 'quarterfinals', 'tbd', 'tbd'),
    makeMatch('qf-3', '', 'quarterfinals', 'tbd', 'tbd'),
    makeMatch('qf-4', '', 'quarterfinals', 'tbd', 'tbd'),
    // SF
    makeMatch('sf-1', '', 'semifinals', 'tbd', 'tbd'),
    makeMatch('sf-2', '', 'semifinals', 'tbd', 'tbd'),
    // Final + third-place
    makeMatch('final', '', 'final', 'tbd', 'tbd'),
    makeMatch('third-place', '', 'third-place', 'tbd', 'tbd'),
  ];

  it('resolves R16 home/away from R32 winners', () => {
    // r16-1 = W-r32-2 vs W-r32-5 → esp vs ned (from dfGroupBets pos-1)
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, dfFullBets, {});
    const r16_1 = bracket.find((m) => m.slug === 'r16-1')!;
    expect(r16_1.homeTeam.resolvedTeam).toBe('esp');
    expect(r16_1.awayTeam.resolvedTeam).toBe('ned');
  });

  it('resolves QF home/away from R16 winners', () => {
    // qf-1 = W-r16-1 vs W-r16-2 → esp vs arg
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, dfFullBets, {});
    const qf_1 = bracket.find((m) => m.slug === 'qf-1')!;
    expect(qf_1.homeTeam.resolvedTeam).toBe('esp');
    expect(qf_1.awayTeam.resolvedTeam).toBe('arg');
  });

  it('resolves SF home/away from QF winners', () => {
    // sf-1 = W-qf-1 vs W-qf-2 → arg vs fra
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, dfFullBets, {});
    const sf_1 = bracket.find((m) => m.slug === 'sf-1')!;
    expect(sf_1.homeTeam.resolvedTeam).toBe('arg');
    expect(sf_1.awayTeam.resolvedTeam).toBe('fra');
  });

  it('resolves Final home/away from SF winners', () => {
    // final = W-sf-1 vs W-sf-2 → arg vs por_w
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, dfFullBets, {});
    const finalMatch = bracket.find((m) => m.slug === 'final')!;
    expect(finalMatch.homeTeam.resolvedTeam).toBe('arg');
    expect(finalMatch.awayTeam.resolvedTeam).toBe('por_w');
  });

  it('resolves third-place home/away from SF losers', () => {
    // third-place = L-sf-1 vs L-sf-2 → fra vs cro (sf losers from dfFullBets)
    // sf-1 = arg vs fra → loser = fra; sf-2 = por_w vs cro → loser = cro
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, dfFullBets, {});
    const third = bracket.find((m) => m.slug === 'third-place')!;
    expect(third.homeTeam.resolvedTeam).toBe('fra');
    expect(third.awayTeam.resolvedTeam).toBe('cro');
  });

  it('R16 resolves from R32 winners; QF+ show TBD when only R32 picks set', () => {
    // Only R32 picks — R16 onwards is empty
    const r32Only: KnockoutBetRecord = {
      'r32-1': 'arg',
      'r32-2': 'esp',
      'r32-3': 'por',
      'r32-4': 'por_w',
      'r32-5': 'ned',
      'r32-6': 'esp_r2',
      'r32-7': 'arg_w',
      'r32-8': 'ita',
      'r32-9': 'por',
      'r32-10': 'fra',
      'r32-11': 'ger_r2',
      'r32-12': 'por',
      'r32-13': 'bra_w',
      'r32-14': 'cro',
      'r32-15': 'ger',
      'r32-16': 'por_r2',
    };
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, r32Only, {});

    // R16 resolves from R32 winners
    const r16_1 = bracket.find((m) => m.slug === 'r16-1')!;
    expect(r16_1.homeTeam.resolvedTeam).toBe('esp');
    expect(r16_1.awayTeam.resolvedTeam).toBe('ned');

    // QF onwards has no picks → TBD
    const qf_1 = bracket.find((m) => m.slug === 'qf-1')!;
    expect(qf_1.homeTeam.resolvedTeam).toBe('TBD');
    expect(qf_1.awayTeam.resolvedTeam).toBe('TBD');
  });

  it('R32 matches show actual team names from group bets even with no knockoutBets', () => {
    const bracket = buildKnockoutBracket(dfGroupBets, allMatches, {}, {});
    const r32_1 = bracket.find((m) => m.slug === 'r32-1')!;
    // r32-1 home = 2A = arg (group-a pos-2), away = 2B = bra (group-b pos-2)
    expect(r32_1.homeTeam.resolvedTeam).toBe('arg');
    expect(r32_1.awayTeam.resolvedTeam).toBe('bra');
  });
});
