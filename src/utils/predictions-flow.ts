import type { Match, PhaseType } from '@app-types/firestore';
import type { ThirdPlacedTeam } from '@app-types/prediction-steps';

import { getCombinationKey, THIRD_PLACE_MATRIX } from '../data/third-place-matrix';

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

export type KnockoutSlotSource =
  | KnockoutSlotSourceGroup
  | KnockoutSlotSourceWinnerOf
  | KnockoutSlotSourceLoserOf;

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
// World Cup 2026 format: 48 teams → 12 groups → 8 R32 matches
export const BRACKET_MAP: Record<string, { home: KnockoutMatchSlot; away: KnockoutMatchSlot }> = {
  // Round of 32 (8 matches)
  'r32-m1': {
    home: { slotId: 'r32-m1-home', source: { from: 'group', groupId: 'A', position: 1 } },
    away: { slotId: 'r32-m1-away', source: { from: 'group', groupId: 'C', position: 3 } },
  },
  'r32-m2': {
    home: { slotId: 'r32-m2-home', source: { from: 'group', groupId: 'B', position: 1 } },
    away: { slotId: 'r32-m2-away', source: { from: 'group', groupId: 'D', position: 3 } },
  },
  'r32-m3': {
    home: { slotId: 'r32-m3-home', source: { from: 'group', groupId: 'E', position: 1 } },
    away: { slotId: 'r32-m3-away', source: { from: 'group', groupId: 'G', position: 3 } },
  },
  'r32-m4': {
    home: { slotId: 'r32-m4-home', source: { from: 'group', groupId: 'F', position: 1 } },
    away: { slotId: 'r32-m4-away', source: { from: 'group', groupId: 'H', position: 3 } },
  },
  'r32-m5': {
    home: { slotId: 'r32-m5-home', source: { from: 'group', groupId: 'I', position: 1 } },
    away: { slotId: 'r32-m5-away', source: { from: 'group', groupId: 'K', position: 3 } },
  },
  'r32-m6': {
    home: { slotId: 'r32-m6-home', source: { from: 'group', groupId: 'J', position: 1 } },
    away: { slotId: 'r32-m6-away', source: { from: 'group', groupId: 'L', position: 3 } },
  },
  'r32-m7': {
    home: { slotId: 'r32-m7-home', source: { from: 'group', groupId: 'A', position: 2 } },
    away: { slotId: 'r32-m7-away', source: { from: 'group', groupId: 'B', position: 2 } },
  },
  'r32-m8': {
    home: { slotId: 'r32-m8-home', source: { from: 'group', groupId: 'C', position: 2 } },
    away: { slotId: 'r32-m8-away', source: { from: 'group', groupId: 'D', position: 2 } },
  },

  // Round of 16 (8 matches)
  'r16-m1': {
    home: { slotId: 'r16-m1-home', source: { from: 'winner-of', matchSlug: 'r32-m1' } },
    away: { slotId: 'r16-m1-away', source: { from: 'winner-of', matchSlug: 'r32-m2' } },
  },
  'r16-m2': {
    home: { slotId: 'r16-m2-home', source: { from: 'winner-of', matchSlug: 'r32-m3' } },
    away: { slotId: 'r16-m2-away', source: { from: 'winner-of', matchSlug: 'r32-m4' } },
  },
  'r16-m3': {
    home: { slotId: 'r16-m3-home', source: { from: 'winner-of', matchSlug: 'r32-m5' } },
    away: { slotId: 'r16-m3-away', source: { from: 'winner-of', matchSlug: 'r32-m6' } },
  },
  'r16-m4': {
    home: { slotId: 'r16-m4-home', source: { from: 'winner-of', matchSlug: 'r32-m7' } },
    away: { slotId: 'r16-m4-away', source: { from: 'winner-of', matchSlug: 'r32-m8' } },
  },
  'r16-m5': {
    home: { slotId: 'r16-m5-home', source: { from: 'winner-of', matchSlug: 'r32-m1' } },
    away: { slotId: 'r16-m5-away', source: { from: 'winner-of', matchSlug: 'r32-m3' } },
  },
  'r16-m6': {
    home: { slotId: 'r16-m6-home', source: { from: 'winner-of', matchSlug: 'r32-m2' } },
    away: { slotId: 'r16-m6-away', source: { from: 'winner-of', matchSlug: 'r32-m4' } },
  },
  'r16-m7': {
    home: { slotId: 'r16-m7-home', source: { from: 'winner-of', matchSlug: 'r32-m5' } },
    away: { slotId: 'r16-m7-away', source: { from: 'winner-of', matchSlug: 'r32-m7' } },
  },
  'r16-m8': {
    home: { slotId: 'r16-m8-home', source: { from: 'winner-of', matchSlug: 'r32-m6' } },
    away: { slotId: 'r16-m8-away', source: { from: 'winner-of', matchSlug: 'r32-m8' } },
  },

  // Quarterfinals (4 matches)
  'qf-m1': {
    home: { slotId: 'qf-m1-home', source: { from: 'winner-of', matchSlug: 'r16-m1' } },
    away: { slotId: 'qf-m1-away', source: { from: 'winner-of', matchSlug: 'r16-m2' } },
  },
  'qf-m2': {
    home: { slotId: 'qf-m2-home', source: { from: 'winner-of', matchSlug: 'r16-m3' } },
    away: { slotId: 'qf-m2-away', source: { from: 'winner-of', matchSlug: 'r16-m4' } },
  },
  'qf-m3': {
    home: { slotId: 'qf-m3-home', source: { from: 'winner-of', matchSlug: 'r16-m5' } },
    away: { slotId: 'qf-m3-away', source: { from: 'winner-of', matchSlug: 'r16-m6' } },
  },
  'qf-m4': {
    home: { slotId: 'qf-m4-home', source: { from: 'winner-of', matchSlug: 'r16-m7' } },
    away: { slotId: 'qf-m4-away', source: { from: 'winner-of', matchSlug: 'r16-m8' } },
  },

  // Semifinals (2 matches)
  'sf-m1': {
    home: { slotId: 'sf-m1-home', source: { from: 'winner-of', matchSlug: 'qf-m1' } },
    away: { slotId: 'sf-m1-away', source: { from: 'winner-of', matchSlug: 'qf-m2' } },
  },
  'sf-m2': {
    home: { slotId: 'sf-m2-home', source: { from: 'winner-of', matchSlug: 'qf-m3' } },
    away: { slotId: 'sf-m2-away', source: { from: 'winner-of', matchSlug: 'qf-m4' } },
  },

  // Third place
  'third-place': {
    home: { slotId: 'tp-home', source: { from: 'loser-of', matchSlug: 'sf-m1' } },
    away: { slotId: 'tp-away', source: { from: 'loser-of', matchSlug: 'sf-m2' } },
  },

  // Final
  final: {
    home: { slotId: 'f-home', source: { from: 'winner-of', matchSlug: 'sf-m1' } },
    away: { slotId: 'f-away', source: { from: 'winner-of', matchSlug: 'sf-m2' } },
  },
};

// Helper to resolve a slot to a team or TBD
function resolveSlot(
  slot: KnockoutMatchSlot,
  groupBetsByGroupId: GroupBetRecord,
  knockoutBets: KnockoutBetRecord,
): string {
  if (slot.source.from === 'group') {
    const groupPositions = groupBetsByGroupId[slot.source.groupId];
    if (!groupPositions || groupPositions.length < slot.source.position) {
      return 'TBD';
    }
    return groupPositions[slot.source.position - 1] || 'TBD';
  }

  // winner-of or loser-of
  const matchSlug = slot.source.matchSlug;
  const winner = knockoutBets[matchSlug];
  if (!winner) return 'TBD';

  if (slot.source.from === 'loser-of') {
    // We'd need the loser, which requires knowing both teams and who won
    // For simplicity, return TBD until we have full loser tracking
    return 'TBD';
  }

  return winner;
}

// 2.6: Build knockout bracket with resolved teams
export function buildKnockoutBracket(
  groupBetsByGroupId: GroupBetRecord,
  knockoutMatches: MatchWithId[],
  knockoutBets: KnockoutBetRecord,
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
        resolvedTeam: resolveSlot(match.homeTeam, groupBetsByGroupId, knockoutBets),
      },
      awayTeam: {
        ...match.awayTeam,
        resolvedTeam: resolveSlot(match.awayTeam, groupBetsByGroupId, knockoutBets),
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

  const advancingGroups = thirdPlacedRecords.slice(0, 8).map((r) => r.groupLetter);
  const combinationKey = getCombinationKey(advancingGroups);
  const slotMapping = THIRD_PLACE_MATRIX[combinationKey] || {};

  return thirdPlacedRecords.map((record, index) => {
    const isAdvancing = index < 8;
    const slot: string | undefined = isAdvancing
      ? Object.entries(slotMapping).find(([, g]) => g === record.groupLetter)?.[0]
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
      bracketMatchSlug: slot ? `r32-${slot.toLowerCase()}` : undefined,
    };
  });
}
