import type { Match, PhaseType } from '@app-types/firestore';
import type { ThirdPlacedTeam } from '@app-types/prediction-steps';

import type { ThirdPlaceSlot } from '@/data/third-place-matrix';
import { getCombinationKey, THIRD_PLACE_MATRIX } from '@/data/third-place-matrix';

export async function ensureThirdPlaceMatrix(): Promise<void> {
  // matrix is statically imported; no warm-up needed
}

// Converts a group slug ('group-a') to a bare uppercase letter ('A')
function letterFromSlug(slug: string): string {
  return slug.replace('group-', '').toUpperCase();
}

export interface MatchWithId extends Match {
  id: string;
}

export interface TeamInfo {
  fifaCode: string;
  name: string;
}

export interface PredictedStanding {
  teamId: string;
  fifaCode: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface PredictionRecord {
  [matchId: string]: { home?: number; away?: number };
}

export interface KnockoutSlotSourceGroup {
  from: 'group';
  groupId: string;
  position: number;
}

export interface KnockoutSlotSourceWinnerOf {
  from: 'winner-of';
  matchSlug: string;
}

export interface KnockoutSlotSourceLoserOf {
  from: 'loser-of';
  matchSlug: string;
}

export interface KnockoutSlotSourceBestThird {
  from: 'best-third';
  matrixSlot: ThirdPlaceSlot;
  eligibleGroups: string[];
}

export type KnockoutSlotSource =
  | KnockoutSlotSourceGroup
  | KnockoutSlotSourceWinnerOf
  | KnockoutSlotSourceLoserOf
  | KnockoutSlotSourceBestThird;

export interface KnockoutMatchSlot {
  slotId: string;
  source: KnockoutSlotSource;
  resolvedTeam?: string;
}

export interface KnockoutMatch {
  slug: string;
  phase: PhaseType;
  homeTeam: KnockoutMatchSlot;
  awayTeam: KnockoutMatchSlot;
}

export interface KnockoutBetRecord {
  [matchSlug: string]: string;
}

export interface GroupBetRecord {
  [groupId: string]: string[];
}

export interface PredictorProgress {
  groupsSubmitted: number;
  totalGroups: number;
  knockoutSubmitted: number;
  totalKnockout: number;
  finalSubmitted: boolean;
  bestPlayersSubmitted: boolean;
}

// 2.1: Get matches for a specific group
export function getGroupMatches(allMatches: MatchWithId[], groupId: string): MatchWithId[] {
  return allMatches.filter((m) => m.groupId === groupId && m.phase === 'group');
}

// 2.2: Calculate standings for a single group
export function calculateGroupStandings(
  matches: MatchWithId[],
  predictions: PredictionRecord,
  teamsMap: Record<string, TeamInfo>,
  groupId: string,
): PredictedStanding[] {
  const groupMatches = matches.filter((m) => m.groupId === groupId && m.phase === 'group');

  const standings: Record<string, PredictedStanding> = {};

  const initTeam = (teamId: string) => {
    if (!standings[teamId]) {
      const team = teamsMap[teamId] || { fifaCode: teamId.toUpperCase(), name: teamId };
      standings[teamId] = {
        teamId,
        fifaCode: team.fifaCode,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      };
    }
  };

  for (const match of groupMatches) {
    const pred = predictions[match.id];
    if (!pred || pred.home == null || pred.away == null) continue;
    if (!match.homeTeamId || !match.awayTeamId) continue;

    initTeam(match.homeTeamId);
    initTeam(match.awayTeamId);

    const home = standings[match.homeTeamId];
    const away = standings[match.awayTeamId];

    home.played++;
    away.played++;
    home.goalsFor += pred.home;
    home.goalsAgainst += pred.away;
    away.goalsFor += pred.away;
    away.goalsAgainst += pred.home;

    if (pred.home > pred.away) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (pred.home < pred.away) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  return Object.values(standings).sort(
    (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );
}

// 2.3: Check if all matches in a group have predictions
export function isGroupMatchesComplete(
  matches: MatchWithId[],
  predictions: PredictionRecord,
  groupId: string,
): boolean {
  const groupMatches = getGroupMatches(matches, groupId);
  if (groupMatches.length === 0) return false;

  return groupMatches.every((m) => {
    const pred = predictions[m.id];
    return pred != null && pred.home != null && pred.away != null;
  });
}

// 2.4: Check if group classification is complete
export function isGroupClassificationComplete(
  positions: string[],
  expectedTeamCount: number,
): boolean {
  if (positions.length !== expectedTeamCount) return false;

  const uniquePositions = new Set(positions.filter((p) => p !== ''));
  return uniquePositions.size === expectedTeamCount;
}

// 2.5: BRACKET_MAP — declarative mapping for knockout slots
// World Cup 2026 format: 48 teams → 12 groups (A-L) → 16 R32 matches (official FIFA bracket)
// Each of the 12 winners (1A-1L) appears exactly once; each of the 12 runners-up (2A-2L) appears
// exactly once; 8 best-third slots are keyed by their official match-number matrix slot.
export const BRACKET_MAP: Record<string, { home: KnockoutMatchSlot; away: KnockoutMatchSlot }> = {
  // Round of 32 (16 matches) — official FIFA WC2026 bracket
  // r32-1 = M73: 2A vs 2B
  'r32-1': {
    home: { slotId: 'r32-1-home', source: { from: 'group', groupId: 'group-a', position: 2 } },
    away: { slotId: 'r32-1-away', source: { from: 'group', groupId: 'group-b', position: 2 } },
  },
  // r32-2 = M74: 1E vs best-third(A/B/C/D/F) — matrix slot M74
  'r32-2': {
    home: { slotId: 'r32-2-home', source: { from: 'group', groupId: 'group-e', position: 1 } },
    away: {
      slotId: 'r32-2-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M74',
        eligibleGroups: ['group-a', 'group-b', 'group-c', 'group-d', 'group-f'],
      },
    },
  },
  // r32-3 = M75: 1F vs 2C
  'r32-3': {
    home: { slotId: 'r32-3-home', source: { from: 'group', groupId: 'group-f', position: 1 } },
    away: { slotId: 'r32-3-away', source: { from: 'group', groupId: 'group-c', position: 2 } },
  },
  // r32-4 = M76: 1C vs 2F
  'r32-4': {
    home: { slotId: 'r32-4-home', source: { from: 'group', groupId: 'group-c', position: 1 } },
    away: { slotId: 'r32-4-away', source: { from: 'group', groupId: 'group-f', position: 2 } },
  },
  // r32-5 = M77: 1I vs best-third(C/D/F/G/H) — matrix slot M77
  'r32-5': {
    home: { slotId: 'r32-5-home', source: { from: 'group', groupId: 'group-i', position: 1 } },
    away: {
      slotId: 'r32-5-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M77',
        eligibleGroups: ['group-c', 'group-d', 'group-f', 'group-g', 'group-h'],
      },
    },
  },
  // r32-6 = M78: 2E vs 2I
  'r32-6': {
    home: { slotId: 'r32-6-home', source: { from: 'group', groupId: 'group-e', position: 2 } },
    away: { slotId: 'r32-6-away', source: { from: 'group', groupId: 'group-i', position: 2 } },
  },
  // r32-7 = M79: 1A vs best-third(C/E/F/H/I) — matrix slot M79
  'r32-7': {
    home: { slotId: 'r32-7-home', source: { from: 'group', groupId: 'group-a', position: 1 } },
    away: {
      slotId: 'r32-7-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M79',
        eligibleGroups: ['group-c', 'group-e', 'group-f', 'group-h', 'group-i'],
      },
    },
  },
  // r32-8 = M80: 1L vs best-third(E/H/I/J/K) — matrix slot M80
  'r32-8': {
    home: { slotId: 'r32-8-home', source: { from: 'group', groupId: 'group-l', position: 1 } },
    away: {
      slotId: 'r32-8-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M80',
        eligibleGroups: ['group-e', 'group-h', 'group-i', 'group-j', 'group-k'],
      },
    },
  },
  // r32-9 = M81: 1D vs best-third(B/E/F/I/J) — matrix slot M81
  'r32-9': {
    home: { slotId: 'r32-9-home', source: { from: 'group', groupId: 'group-d', position: 1 } },
    away: {
      slotId: 'r32-9-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M81',
        eligibleGroups: ['group-b', 'group-e', 'group-f', 'group-i', 'group-j'],
      },
    },
  },
  // r32-10 = M82: 1G vs best-third(A/E/H/I/J) — matrix slot M82
  'r32-10': {
    home: { slotId: 'r32-10-home', source: { from: 'group', groupId: 'group-g', position: 1 } },
    away: {
      slotId: 'r32-10-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M82',
        eligibleGroups: ['group-a', 'group-e', 'group-h', 'group-i', 'group-j'],
      },
    },
  },
  // r32-11 = M83: 2K vs 2L
  'r32-11': {
    home: { slotId: 'r32-11-home', source: { from: 'group', groupId: 'group-k', position: 2 } },
    away: { slotId: 'r32-11-away', source: { from: 'group', groupId: 'group-l', position: 2 } },
  },
  // r32-12 = M84: 1H vs 2J
  'r32-12': {
    home: { slotId: 'r32-12-home', source: { from: 'group', groupId: 'group-h', position: 1 } },
    away: { slotId: 'r32-12-away', source: { from: 'group', groupId: 'group-j', position: 2 } },
  },
  // r32-13 = M85: 1B vs best-third(E/F/G/I/J) — matrix slot M85
  'r32-13': {
    home: { slotId: 'r32-13-home', source: { from: 'group', groupId: 'group-b', position: 1 } },
    away: {
      slotId: 'r32-13-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M85',
        eligibleGroups: ['group-e', 'group-f', 'group-g', 'group-i', 'group-j'],
      },
    },
  },
  // r32-14 = M86: 1J vs 2H
  'r32-14': {
    home: { slotId: 'r32-14-home', source: { from: 'group', groupId: 'group-j', position: 1 } },
    away: { slotId: 'r32-14-away', source: { from: 'group', groupId: 'group-h', position: 2 } },
  },
  // r32-15 = M87: 1K vs best-third(D/E/I/J/L) — matrix slot M87
  'r32-15': {
    home: { slotId: 'r32-15-home', source: { from: 'group', groupId: 'group-k', position: 1 } },
    away: {
      slotId: 'r32-15-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M87',
        eligibleGroups: ['group-d', 'group-e', 'group-i', 'group-j', 'group-l'],
      },
    },
  },
  // r32-16 = M88: 2D vs 2G
  'r32-16': {
    home: { slotId: 'r32-16-home', source: { from: 'group', groupId: 'group-d', position: 2 } },
    away: { slotId: 'r32-16-away', source: { from: 'group', groupId: 'group-g', position: 2 } },
  },

  // Round of 16 (8 matches) — official FIFA WC2026 cross-pairings
  // r16-1 = M89: W-r32-2 vs W-r32-5
  'r16-1': {
    home: { slotId: 'r16-1-home', source: { from: 'winner-of', matchSlug: 'r32-2' } },
    away: { slotId: 'r16-1-away', source: { from: 'winner-of', matchSlug: 'r32-5' } },
  },
  // r16-2 = M90: W-r32-1 vs W-r32-3
  'r16-2': {
    home: { slotId: 'r16-2-home', source: { from: 'winner-of', matchSlug: 'r32-1' } },
    away: { slotId: 'r16-2-away', source: { from: 'winner-of', matchSlug: 'r32-3' } },
  },
  // r16-3 = M91: W-r32-4 vs W-r32-6
  'r16-3': {
    home: { slotId: 'r16-3-home', source: { from: 'winner-of', matchSlug: 'r32-4' } },
    away: { slotId: 'r16-3-away', source: { from: 'winner-of', matchSlug: 'r32-6' } },
  },
  // r16-4 = M92: W-r32-7 vs W-r32-8
  'r16-4': {
    home: { slotId: 'r16-4-home', source: { from: 'winner-of', matchSlug: 'r32-7' } },
    away: { slotId: 'r16-4-away', source: { from: 'winner-of', matchSlug: 'r32-8' } },
  },
  // r16-5 = M93: W-r32-11 vs W-r32-12
  'r16-5': {
    home: { slotId: 'r16-5-home', source: { from: 'winner-of', matchSlug: 'r32-11' } },
    away: { slotId: 'r16-5-away', source: { from: 'winner-of', matchSlug: 'r32-12' } },
  },
  // r16-6 = M94: W-r32-9 vs W-r32-10
  'r16-6': {
    home: { slotId: 'r16-6-home', source: { from: 'winner-of', matchSlug: 'r32-9' } },
    away: { slotId: 'r16-6-away', source: { from: 'winner-of', matchSlug: 'r32-10' } },
  },
  // r16-7 = M95: W-r32-14 vs W-r32-16
  'r16-7': {
    home: { slotId: 'r16-7-home', source: { from: 'winner-of', matchSlug: 'r32-14' } },
    away: { slotId: 'r16-7-away', source: { from: 'winner-of', matchSlug: 'r32-16' } },
  },
  // r16-8 = M96: W-r32-13 vs W-r32-15
  'r16-8': {
    home: { slotId: 'r16-8-home', source: { from: 'winner-of', matchSlug: 'r32-13' } },
    away: { slotId: 'r16-8-away', source: { from: 'winner-of', matchSlug: 'r32-15' } },
  },

  // Quarterfinals (4 matches) — official FIFA WC2026 bracket
  // qf-1 = M97: W-r16-1 vs W-r16-2
  'qf-1': {
    home: { slotId: 'qf-1-home', source: { from: 'winner-of', matchSlug: 'r16-1' } },
    away: { slotId: 'qf-1-away', source: { from: 'winner-of', matchSlug: 'r16-2' } },
  },
  // qf-2 = M98: W-r16-5 vs W-r16-6
  'qf-2': {
    home: { slotId: 'qf-2-home', source: { from: 'winner-of', matchSlug: 'r16-5' } },
    away: { slotId: 'qf-2-away', source: { from: 'winner-of', matchSlug: 'r16-6' } },
  },
  // qf-3 = M99: W-r16-3 vs W-r16-4
  'qf-3': {
    home: { slotId: 'qf-3-home', source: { from: 'winner-of', matchSlug: 'r16-3' } },
    away: { slotId: 'qf-3-away', source: { from: 'winner-of', matchSlug: 'r16-4' } },
  },
  // qf-4 = M100: W-r16-7 vs W-r16-8
  'qf-4': {
    home: { slotId: 'qf-4-home', source: { from: 'winner-of', matchSlug: 'r16-7' } },
    away: { slotId: 'qf-4-away', source: { from: 'winner-of', matchSlug: 'r16-8' } },
  },

  // Semifinals (2 matches)
  // sf-1 = M101: W-qf-1 vs W-qf-2
  'sf-1': {
    home: { slotId: 'sf-1-home', source: { from: 'winner-of', matchSlug: 'qf-1' } },
    away: { slotId: 'sf-1-away', source: { from: 'winner-of', matchSlug: 'qf-2' } },
  },
  // sf-2 = M102: W-qf-3 vs W-qf-4
  'sf-2': {
    home: { slotId: 'sf-2-home', source: { from: 'winner-of', matchSlug: 'qf-3' } },
    away: { slotId: 'sf-2-away', source: { from: 'winner-of', matchSlug: 'qf-4' } },
  },

  // Third place — M103
  'third-place': {
    home: { slotId: 'tp-home', source: { from: 'loser-of', matchSlug: 'sf-1' } },
    away: { slotId: 'tp-away', source: { from: 'loser-of', matchSlug: 'sf-2' } },
  },

  // Final — M104
  final: {
    home: { slotId: 'f-home', source: { from: 'winner-of', matchSlug: 'sf-1' } },
    away: { slotId: 'f-away', source: { from: 'winner-of', matchSlug: 'sf-2' } },
  },
};

// Helper to resolve a slot to a team or TBD (unified recursive resolver)
// D-01: returns 'TBD' only for genuinely-unknown slots; never blocks on round completion
// D-02: validates stored winner against resolved feeders; stale picks return 'TBD' transitively
function resolveSlot(
  slot: KnockoutMatchSlot,
  groupBetsByGroupId: GroupBetRecord,
  knockoutBets: KnockoutBetRecord,
  confirmedAdvancingMap?: Record<string, string>,
): string {
  const { source } = slot;

  if (source.from === 'group') {
    const positions = groupBetsByGroupId[source.groupId]; // 'group-a' form
    return positions?.[source.position - 1] ?? 'TBD';
  }

  if (source.from === 'best-third') {
    if (!confirmedAdvancingMap) return 'TBD';
    // Matrix-driven resolution: derive the combination key from advancing group letters,
    // then look up which group letter occupies this slot in the matrix.
    const advancingKeys = Object.keys(confirmedAdvancingMap);
    if (advancingKeys.length < 8) return 'TBD'; // fewer than 8 advancing groups — graceful
    const letters = advancingKeys.map((slug) => slug.replace('group-', '').toUpperCase());
    const combinationKey = getCombinationKey(letters);
    const letter = THIRD_PLACE_MATRIX[combinationKey]?.[source.matrixSlot];
    if (!letter) return 'TBD';
    return confirmedAdvancingMap['group-' + letter.toLowerCase()] ?? 'TBD';
  }

  // winner-of or loser-of — recursive resolution
  const { matchSlug } = source;
  const entry = BRACKET_MAP[matchSlug];
  if (!entry) return 'TBD';

  const homeTeam = resolveSlot(entry.home, groupBetsByGroupId, knockoutBets, confirmedAdvancingMap);
  const awayTeam = resolveSlot(entry.away, groupBetsByGroupId, knockoutBets, confirmedAdvancingMap);
  const storedWinner = knockoutBets[matchSlug];

  if (source.from === 'winner-of') {
    if (!storedWinner) return 'TBD';
    // D-02: validate stored winner against whichever feeders are already resolved (WR-01 fix)
    if (homeTeam !== 'TBD' && storedWinner === homeTeam) return storedWinner;
    if (awayTeam !== 'TBD' && storedWinner === awayTeam) return storedWinner;
    if (homeTeam === 'TBD' && awayTeam === 'TBD') return storedWinner;
    return 'TBD'; // at least one feeder resolved and storedWinner matched neither — stale
  }

  // loser-of: both feeders must be resolved to derive the loser
  if (homeTeam === 'TBD' || awayTeam === 'TBD') return 'TBD';
  if (!storedWinner) return 'TBD';
  // D-02 + WR-01: storedWinner must match one of the two resolved feeders
  if (storedWinner !== homeTeam && storedWinner !== awayTeam) return 'TBD';
  return storedWinner === homeTeam ? awayTeam : homeTeam;
}

// 2.6: Build knockout bracket with resolved teams
export function buildKnockoutBracket(
  groupBetsByGroupId: GroupBetRecord,
  knockoutMatches: MatchWithId[],
  knockoutBets: KnockoutBetRecord,
  confirmedAdvancingMap?: Record<string, string>,
): KnockoutMatch[] {
  return knockoutMatches
    .map((match) => {
      const bracketEntry = BRACKET_MAP[match.slug];
      if (!bracketEntry) {
        return {
          slug: match.slug,
          phase: match.phase,
          homeTeam: {
            slotId: `${match.slug}-home`,
            source: { from: 'group', groupId: '', position: 0 },
          },
          awayTeam: {
            slotId: `${match.slug}-away`,
            source: { from: 'group', groupId: '', position: 0 },
          },
        };
      }

      return {
        slug: match.slug,
        phase: match.phase,
        homeTeam: {
          ...bracketEntry.home,
        },
        awayTeam: {
          ...bracketEntry.away,
        },
      };
    })
    .map((match) => ({
      ...match,
      homeTeam: {
        ...match.homeTeam,
        resolvedTeam: resolveSlot(
          match.homeTeam,
          groupBetsByGroupId,
          knockoutBets,
          confirmedAdvancingMap,
        ),
      },
      awayTeam: {
        ...match.awayTeam,
        resolvedTeam: resolveSlot(
          match.awayTeam,
          groupBetsByGroupId,
          knockoutBets,
          confirmedAdvancingMap,
        ),
      },
    })) as unknown as (KnockoutMatch & {
    homeTeam: { resolvedTeam: string };
    awayTeam: { resolvedTeam: string };
  })[];
}

// 2.7: Get predictor progress
export const KNOCKOUT_PHASES: PhaseType[] = [
  'round-of-32',
  'round-of-16',
  'quarterfinals',
  'semifinals',
  'third-place',
  'final',
];

export function getPredictorProgress(
  allMatches: MatchWithId[],
  groupBets: GroupBetRecord,
  knockoutBets: KnockoutBetRecord,
  hasFinalPhase: boolean,
  hasBestPlayers: boolean,
): PredictorProgress {
  const totalGroups = [
    ...new Set(allMatches.filter((m) => m.phase === 'group').map((m) => m.groupId)),
  ].length;
  const groupsSubmitted = Object.keys(groupBets).filter((g) => {
    const positions = groupBets[g];
    return positions && positions.length === 4;
  }).length;

  const knockoutMatches = allMatches.filter((m) => KNOCKOUT_PHASES.includes(m.phase as PhaseType));
  const totalKnockout = knockoutMatches.length;
  const knockoutSubmitted = knockoutMatches.filter((m) => knockoutBets[m.slug]).length;

  return {
    groupsSubmitted,
    totalGroups,
    knockoutSubmitted,
    totalKnockout,
    finalSubmitted: hasFinalPhase,
    bestPlayersSubmitted: hasBestPlayers,
  };
}

// Maps an official match-number matrix slot to the seed slug for that R32 match
const MATRIX_SLOT_TO_SEED_SLUG: Partial<Record<string, string>> = {
  M74: 'r32-2',
  M77: 'r32-5',
  M79: 'r32-7',
  M80: 'r32-8',
  M81: 'r32-9',
  M82: 'r32-10',
  M85: 'r32-13',
  M87: 'r32-15',
};

export function computeThirdPlaceStandings(
  groupBets: GroupBetRecord,
  matchPredictions: PredictionRecord,
  matches: MatchWithId[],
  teamsMap: Record<string, TeamInfo>,
  groups: { slug: string }[],
  confirmedAdvancingGroupSlugs?: string[],
): ThirdPlacedTeam[] {
  const thirdPlacedRecords: Array<{
    teamId: string;
    teamName: string;
    groupLetter: string;
    groupSlug: string;
    points: number;
    goalDifference: number;
    goalsScored: number;
  }> = [];

  for (const group of groups) {
    const positions = groupBets[group.slug];
    if (!positions || positions.length < 4) continue;
    const thirdPlaceTeamId = positions[3];

    const standings = calculateGroupStandings(matches, matchPredictions, teamsMap, group.slug);
    const teamStanding = standings.find((s) => s.teamId === thirdPlaceTeamId);
    const team = teamsMap[thirdPlaceTeamId];

    thirdPlacedRecords.push({
      teamId: thirdPlaceTeamId,
      teamName: team?.name || thirdPlaceTeamId,
      groupLetter: letterFromSlug(group.slug), // bare letter 'A', not 'group-a'
      groupSlug: group.slug,
      points: teamStanding?.points ?? 0,
      goalDifference: (teamStanding?.goalsFor ?? 0) - (teamStanding?.goalsAgainst ?? 0),
      goalsScored: teamStanding?.goalsFor ?? 0,
    });
  }

  // D-03: deterministic sort — points (desc) → GD (desc) → GF (desc) → groupLetter (asc) → teamId (asc)
  thirdPlacedRecords.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
    if (a.groupLetter !== b.groupLetter) return a.groupLetter.localeCompare(b.groupLetter);
    return a.teamId.localeCompare(b.teamId);
  });

  // D-04: use confirmed advancing set if provided; otherwise default to deterministic top-8
  const advancingSet =
    confirmedAdvancingGroupSlugs ?? thirdPlacedRecords.slice(0, 8).map((r) => r.groupSlug);

  // Derive bracketMatchSlug for each advancing team via the third-place matrix.
  // Requires exactly 8 advancing groups; gracefully returns undefined if <8 or key missing (D-05).
  let combinationKey: string | undefined;
  let matrixRow: Partial<Record<string, string>> | undefined;
  if (advancingSet.length === 8) {
    const advancingLetters = advancingSet.map((slug) => slug.replace('group-', '').toUpperCase());
    combinationKey = getCombinationKey(advancingLetters);
    matrixRow = THIRD_PLACE_MATRIX[combinationKey];
  }

  return thirdPlacedRecords.map((record) => {
    // D-04: advancing reflects user's confirmed set, not a hardcoded slice
    const isAdvancing = advancingSet.includes(record.groupSlug);

    // Derive bracketMatchSlug: find which matrix slot this group's letter occupies,
    // then map that slot to its seed slug. Only possible when matrix row is available.
    let bracketMatchSlug: string | undefined;
    if (isAdvancing && matrixRow) {
      const matchingSlot = Object.entries(matrixRow).find(
        ([, groupLetter]) => groupLetter === record.groupLetter,
      )?.[0];
      bracketMatchSlug = matchingSlot ? MATRIX_SLOT_TO_SEED_SLUG[matchingSlot] : undefined;
    }

    return {
      rank: thirdPlacedRecords.indexOf(record) + 1,
      teamId: record.teamId,
      teamName: record.teamName,
      groupLetter: record.groupLetter,
      points: record.points,
      goalDifference: record.goalDifference,
      goalsScored: record.goalsScored,
      advancing: isAdvancing,
      bracketSlotLabel: bracketMatchSlug,
      bracketMatchSlug,
    };
  });
}

export interface FinalFourResult {
  first: string; // 'TBD' if final winner unknown
  second: string; // 'TBD' if final loser unknown
  third: string; // 'TBD' if third-place winner unknown
  fourth: string; // 'TBD' if third-place loser unknown
}

// Derives the predicted final standings from knockout bets.
// D-01: progressive — each field resolves independently; only truly-unknown slots return 'TBD'.
// D-02: stale picks (stored winner not matching resolved feeders) return 'TBD' transitively.
export function deriveFinalFour(
  knockoutBets: KnockoutBetRecord,
  groupBetsByGroupId: GroupBetRecord,
): FinalFourResult {
  // first = winner of 'final' (validated against sf-1 and sf-2 winners via D-02)
  const first = resolveSlot(
    { slotId: 'derive-first', source: { from: 'winner-of', matchSlug: 'final' } },
    groupBetsByGroupId,
    knockoutBets,
  );

  // second = loser of 'final' (the sf winner who did not win the final)
  const second = resolveSlot(
    { slotId: 'derive-second', source: { from: 'loser-of', matchSlug: 'final' } },
    groupBetsByGroupId,
    knockoutBets,
  );

  // third = winner of 'third-place' match (loser-of sf-1 vs loser-of sf-2)
  const third = resolveSlot(
    { slotId: 'derive-third', source: { from: 'winner-of', matchSlug: 'third-place' } },
    groupBetsByGroupId,
    knockoutBets,
  );

  // fourth = loser of 'third-place' match
  const fourth = resolveSlot(
    { slotId: 'derive-fourth', source: { from: 'loser-of', matchSlug: 'third-place' } },
    groupBetsByGroupId,
    knockoutBets,
  );

  return { first, second, third, fourth };
}
