import type { Match, PhaseType } from '@app-types/firestore';
import type { ThirdPlacedTeam } from '@app-types/prediction-steps';

import { getCombinationKey, THIRD_PLACE_MATRIX } from '../data/third-place-matrix';

export async function ensureThirdPlaceMatrix(): Promise<void> {
  // matrix is statically imported; no warm-up needed
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
// World Cup 2026 format: 48 teams → 12 groups → 16 R32 matches (seed-faithful)
export const BRACKET_MAP: Record<string, { home: KnockoutMatchSlot; away: KnockoutMatchSlot }> = {
  // Round of 32 (16 matches) — each group winner vs a best-third team
  'r32-1': {
    home: { slotId: 'r32-1-home', source: { from: 'group', groupId: 'group-a', position: 1 } },
    away: {
      slotId: 'r32-1-away',
      source: { from: 'best-third', eligibleGroups: ['group-c', 'group-d', 'group-e'] },
    },
  },
  'r32-2': {
    home: { slotId: 'r32-2-home', source: { from: 'group', groupId: 'group-c', position: 1 } },
    away: {
      slotId: 'r32-2-away',
      source: { from: 'best-third', eligibleGroups: ['group-a', 'group-b', 'group-f'] },
    },
  },
  'r32-3': {
    home: { slotId: 'r32-3-home', source: { from: 'group', groupId: 'group-e', position: 1 } },
    away: {
      slotId: 'r32-3-away',
      source: { from: 'best-third', eligibleGroups: ['group-g', 'group-h', 'group-k'] },
    },
  },
  'r32-4': {
    home: { slotId: 'r32-4-home', source: { from: 'group', groupId: 'group-g', position: 1 } },
    away: {
      slotId: 'r32-4-away',
      source: { from: 'best-third', eligibleGroups: ['group-i', 'group-j', 'group-l'] },
    },
  },
  'r32-5': {
    home: { slotId: 'r32-5-home', source: { from: 'group', groupId: 'group-b', position: 1 } },
    away: {
      slotId: 'r32-5-away',
      source: { from: 'best-third', eligibleGroups: ['group-a', 'group-b', 'group-f'] },
    },
  },
  'r32-6': {
    home: { slotId: 'r32-6-home', source: { from: 'group', groupId: 'group-d', position: 1 } },
    away: {
      slotId: 'r32-6-away',
      source: { from: 'best-third', eligibleGroups: ['group-c', 'group-d', 'group-e'] },
    },
  },
  'r32-7': {
    home: { slotId: 'r32-7-home', source: { from: 'group', groupId: 'group-f', position: 1 } },
    away: {
      slotId: 'r32-7-away',
      source: { from: 'best-third', eligibleGroups: ['group-g', 'group-h', 'group-k'] },
    },
  },
  'r32-8': {
    home: { slotId: 'r32-8-home', source: { from: 'group', groupId: 'group-h', position: 1 } },
    away: {
      slotId: 'r32-8-away',
      source: { from: 'best-third', eligibleGroups: ['group-i', 'group-j', 'group-l'] },
    },
  },
  'r32-9': {
    home: { slotId: 'r32-9-home', source: { from: 'group', groupId: 'group-i', position: 1 } },
    away: {
      slotId: 'r32-9-away',
      source: { from: 'best-third', eligibleGroups: ['group-g', 'group-h', 'group-k'] },
    },
  },
  'r32-10': {
    home: { slotId: 'r32-10-home', source: { from: 'group', groupId: 'group-k', position: 1 } },
    away: {
      slotId: 'r32-10-away',
      source: { from: 'best-third', eligibleGroups: ['group-i', 'group-j', 'group-l'] },
    },
  },
  'r32-11': {
    home: { slotId: 'r32-11-home', source: { from: 'group', groupId: 'group-a', position: 1 } },
    away: {
      slotId: 'r32-11-away',
      source: { from: 'best-third', eligibleGroups: ['group-a', 'group-b', 'group-f'] },
    },
  },
  'r32-12': {
    home: { slotId: 'r32-12-home', source: { from: 'group', groupId: 'group-c', position: 1 } },
    away: {
      slotId: 'r32-12-away',
      source: { from: 'best-third', eligibleGroups: ['group-c', 'group-d', 'group-e'] },
    },
  },
  'r32-13': {
    home: { slotId: 'r32-13-home', source: { from: 'group', groupId: 'group-e', position: 1 } },
    away: {
      slotId: 'r32-13-away',
      source: { from: 'best-third', eligibleGroups: ['group-i', 'group-j', 'group-l'] },
    },
  },
  'r32-14': {
    home: { slotId: 'r32-14-home', source: { from: 'group', groupId: 'group-g', position: 1 } },
    away: {
      slotId: 'r32-14-away',
      source: { from: 'best-third', eligibleGroups: ['group-a', 'group-b', 'group-f'] },
    },
  },
  'r32-15': {
    home: { slotId: 'r32-15-home', source: { from: 'group', groupId: 'group-b', position: 1 } },
    away: {
      slotId: 'r32-15-away',
      source: { from: 'best-third', eligibleGroups: ['group-c', 'group-d', 'group-e'] },
    },
  },
  'r32-16': {
    home: { slotId: 'r32-16-home', source: { from: 'group', groupId: 'group-d', position: 1 } },
    away: {
      slotId: 'r32-16-away',
      source: { from: 'best-third', eligibleGroups: ['group-g', 'group-h', 'group-k'] },
    },
  },

  // Round of 16 (8 matches) — strictly sequential: r16-N = W-r32-(2N-1) vs W-r32-(2N)
  'r16-1': {
    home: { slotId: 'r16-1-home', source: { from: 'winner-of', matchSlug: 'r32-1' } },
    away: { slotId: 'r16-1-away', source: { from: 'winner-of', matchSlug: 'r32-2' } },
  },
  'r16-2': {
    home: { slotId: 'r16-2-home', source: { from: 'winner-of', matchSlug: 'r32-3' } },
    away: { slotId: 'r16-2-away', source: { from: 'winner-of', matchSlug: 'r32-4' } },
  },
  'r16-3': {
    home: { slotId: 'r16-3-home', source: { from: 'winner-of', matchSlug: 'r32-5' } },
    away: { slotId: 'r16-3-away', source: { from: 'winner-of', matchSlug: 'r32-6' } },
  },
  'r16-4': {
    home: { slotId: 'r16-4-home', source: { from: 'winner-of', matchSlug: 'r32-7' } },
    away: { slotId: 'r16-4-away', source: { from: 'winner-of', matchSlug: 'r32-8' } },
  },
  'r16-5': {
    home: { slotId: 'r16-5-home', source: { from: 'winner-of', matchSlug: 'r32-9' } },
    away: { slotId: 'r16-5-away', source: { from: 'winner-of', matchSlug: 'r32-10' } },
  },
  'r16-6': {
    home: { slotId: 'r16-6-home', source: { from: 'winner-of', matchSlug: 'r32-11' } },
    away: { slotId: 'r16-6-away', source: { from: 'winner-of', matchSlug: 'r32-12' } },
  },
  'r16-7': {
    home: { slotId: 'r16-7-home', source: { from: 'winner-of', matchSlug: 'r32-13' } },
    away: { slotId: 'r16-7-away', source: { from: 'winner-of', matchSlug: 'r32-14' } },
  },
  'r16-8': {
    home: { slotId: 'r16-8-home', source: { from: 'winner-of', matchSlug: 'r32-15' } },
    away: { slotId: 'r16-8-away', source: { from: 'winner-of', matchSlug: 'r32-16' } },
  },

  // Quarterfinals (4 matches)
  'qf-1': {
    home: { slotId: 'qf-1-home', source: { from: 'winner-of', matchSlug: 'r16-1' } },
    away: { slotId: 'qf-1-away', source: { from: 'winner-of', matchSlug: 'r16-2' } },
  },
  'qf-2': {
    home: { slotId: 'qf-2-home', source: { from: 'winner-of', matchSlug: 'r16-3' } },
    away: { slotId: 'qf-2-away', source: { from: 'winner-of', matchSlug: 'r16-4' } },
  },
  'qf-3': {
    home: { slotId: 'qf-3-home', source: { from: 'winner-of', matchSlug: 'r16-5' } },
    away: { slotId: 'qf-3-away', source: { from: 'winner-of', matchSlug: 'r16-6' } },
  },
  'qf-4': {
    home: { slotId: 'qf-4-home', source: { from: 'winner-of', matchSlug: 'r16-7' } },
    away: { slotId: 'qf-4-away', source: { from: 'winner-of', matchSlug: 'r16-8' } },
  },

  // Semifinals (2 matches)
  'sf-1': {
    home: { slotId: 'sf-1-home', source: { from: 'winner-of', matchSlug: 'qf-1' } },
    away: { slotId: 'sf-1-away', source: { from: 'winner-of', matchSlug: 'qf-2' } },
  },
  'sf-2': {
    home: { slotId: 'sf-2-home', source: { from: 'winner-of', matchSlug: 'qf-3' } },
    away: { slotId: 'sf-2-away', source: { from: 'winner-of', matchSlug: 'qf-4' } },
  },

  // Third place
  'third-place': {
    home: { slotId: 'tp-home', source: { from: 'loser-of', matchSlug: 'sf-1' } },
    away: { slotId: 'tp-away', source: { from: 'loser-of', matchSlug: 'sf-2' } },
  },

  // Final
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
    const match = source.eligibleGroups.find((g) => confirmedAdvancingMap[g]);
    return match ? (confirmedAdvancingMap[match] ?? 'TBD') : 'TBD';
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
    // D-02: validate stored winner is still a valid feeder (when both feeders are resolved)
    if (homeTeam !== 'TBD' && awayTeam !== 'TBD') {
      if (storedWinner !== homeTeam && storedWinner !== awayTeam) return 'TBD'; // stale pick
    }
    return storedWinner;
  }

  // loser-of
  if (homeTeam === 'TBD' || awayTeam === 'TBD') return 'TBD';
  if (!storedWinner) return 'TBD';
  if (storedWinner !== homeTeam && storedWinner !== awayTeam) return 'TBD'; // D-02
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

export function computeThirdPlaceStandings(
  groupBets: GroupBetRecord,
  matchPredictions: PredictionRecord,
  matches: MatchWithId[],
  teamsMap: Record<string, TeamInfo>,
  groups: { slug: string }[],
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
      groupLetter: group.slug,
      groupSlug: group.slug,
      points: teamStanding?.points || 0,
      goalDifference: (teamStanding?.goalsFor || 0) - (teamStanding?.goalsAgainst || 0),
      goalsScored: teamStanding?.goalsFor || 0,
    });
  }

  thirdPlacedRecords.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
    return 0;
  });

  const letterFromSlug = (slug: string) => slug.replace('group-', '').toUpperCase();
  const advancingGroups = thirdPlacedRecords.slice(0, 8).map((r) => r.groupSlug);
  const advancingLetters = advancingGroups.map(letterFromSlug);
  const combinationKey = getCombinationKey(advancingLetters);
  const slotMapping = THIRD_PLACE_MATRIX[combinationKey] ?? {};

  return thirdPlacedRecords.map((record, index) => {
    const isAdvancing = index < 8;
    const recordLetter = letterFromSlug(record.groupSlug);
    const slot: string | undefined = isAdvancing
      ? Object.entries(slotMapping).find(([, g]) => g === recordLetter)?.[0]
      : undefined;

    return {
      rank: index + 1,
      teamId: record.teamId,
      teamName: record.teamName,
      groupLetter: record.groupLetter,
      points: record.points,
      goalDifference: record.goalDifference,
      goalsScored: record.goalsScored,
      advancing: isAdvancing,
      bracketSlotLabel: slot ? `Match ${slot.replace('M', '')}` : undefined,
      // bracketMatchSlug intentionally omitted: official slot names (M74 etc.) don't map 1:1 to seed slugs
      bracketMatchSlug: undefined,
    };
  });
}
