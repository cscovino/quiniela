import { getCombinationKey, THIRD_PLACE_MATRIX } from '../data/third-place-matrix';
import { BRACKET_MAP, type BracketEntry, type KnockoutMatchSlot } from './bracket';

export interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStandingsData {
  groupId: string;
  standings: TeamStanding[];
}

export interface MatchResult {
  slug: string;
  status: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  result: { home: number | null; away: number | null };
}

export interface ResolvedMatch {
  slug: string;
  homeTeamId: string;
  awayTeamId: string;
}

export interface ResolutionResult {
  resolved: ResolvedMatch[];
  unresolved: string[];
}

const UPPER = (s: string): string => s.toUpperCase();

const normalizeGroupId = (g: string): string => g.toLowerCase();

const normalizeTeamId = (t: string | null): string | null => (t ? UPPER(t) : null);

function resolveSlot(
  slot: KnockoutMatchSlot,
  groupStandings: Map<string, GroupStandingsData>,
  matchResults: Map<string, MatchResult>,
): string | null {
  const { source } = slot;

  if (source.from === 'group') {
    const standings = groupStandings.get(normalizeGroupId(source.groupId));
    if (!standings) return null;
    const team = standings.standings[source.position - 1];
    return team ? normalizeTeamId(team.teamId) : null;
  }

  if (source.from === 'best-third') {
    return resolveBestThird(source.matrixSlot, source.eligibleGroups, groupStandings);
  }

  if (source.from === 'winner-of') {
    return resolveWinnerOf(source.matchSlug, matchResults);
  }

  if (source.from === 'loser-of') {
    return resolveLoserOf(source.matchSlug, matchResults);
  }

  return null;
}

function resolveBestThird(
  matrixSlot: 'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87',
  _eligibleGroups: string[],
  groupStandings: Map<string, GroupStandingsData>,
): string | null {
  const thirdPlaceTeams: { letter: string; teamId: string; standing: TeamStanding }[] = [];

  for (const [groupId, standings] of groupStandings.entries()) {
    const third = standings.standings[2];
    if (!third) continue;
    const letter = UPPER(groupId.replace('group-', ''));
    thirdPlaceTeams.push({ letter, teamId: normalizeTeamId(third.teamId)!, standing: third });
  }

  if (thirdPlaceTeams.length < 12) return null;

  thirdPlaceTeams.sort((a, b) => compareThirdPlace(a.standing, b.standing));

  const advancing = thirdPlaceTeams.slice(0, 8);
  const advancingLetters = advancing.map((t) => t.letter).sort();
  const combinationKey = getCombinationKey(advancingLetters);
  const letter = THIRD_PLACE_MATRIX[combinationKey]?.[matrixSlot];
  if (!letter) return null;

  const match = advancing.find((t) => t.letter === letter);
  return match?.teamId ?? null;
}

function compareThirdPlace(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.teamId.localeCompare(b.teamId);
}

function resolveWinnerOf(slug: string, matchResults: Map<string, MatchResult>): string | null {
  const match = matchResults.get(slug);
  if (!match) return null;
  if (match.status !== 'finished') return null;
  if (match.result.home === null || match.result.away === null) return null;
  if (!match.homeTeamId || !match.awayTeamId) return null;

  const homeWin = match.result.home > match.result.away;
  return normalizeTeamId(homeWin ? match.homeTeamId : match.awayTeamId);
}

function resolveLoserOf(slug: string, matchResults: Map<string, MatchResult>): string | null {
  const match = matchResults.get(slug);
  if (!match) return null;
  if (match.status !== 'finished') return null;
  if (match.result.home === null || match.result.away === null) return null;
  if (!match.homeTeamId || !match.awayTeamId) return null;

  const homeWin = match.result.home > match.result.away;
  return normalizeTeamId(homeWin ? match.awayTeamId : match.homeTeamId);
}

function resolveEntry(
  slug: string,
  entry: BracketEntry,
  groupStandings: Map<string, GroupStandingsData>,
  matchResults: Map<string, MatchResult>,
): ResolvedMatch | null {
  const homeTeamId = resolveSlot(entry.home, groupStandings, matchResults);
  const awayTeamId = resolveSlot(entry.away, groupStandings, matchResults);
  if (!homeTeamId || !awayTeamId) return null;
  return { slug, homeTeamId, awayTeamId };
}

export function resolveAllBrackets(
  groupStandings: GroupStandingsData[],
  matchResults: MatchResult[],
): ResolutionResult {
  const groupMap = new Map<string, GroupStandingsData>();
  for (const gs of groupStandings) {
    groupMap.set(normalizeGroupId(gs.groupId), gs);
  }
  const matchMap = new Map<string, MatchResult>();
  for (const m of matchResults) {
    matchMap.set(m.slug, m);
  }

  const resolved: ResolvedMatch[] = [];
  const unresolved: string[] = [];

  for (const [slug, entry] of Object.entries(BRACKET_MAP)) {
    const result = resolveEntry(slug, entry, groupMap, matchMap);
    if (result) resolved.push(result);
    else unresolved.push(slug);
  }

  return { resolved, unresolved };
}

export function diffResolution(
  current: Map<string, { homeTeamId: string | null; awayTeamId: string | null }>,
  resolution: ResolutionResult,
): ResolvedMatch[] {
  return resolution.resolved.filter((m) => {
    const before = current.get(m.slug);
    return !before || before.homeTeamId !== m.homeTeamId || before.awayTeamId !== m.awayTeamId;
  });
}
