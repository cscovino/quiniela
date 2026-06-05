import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import type { MatchCardProps } from '@molecules/MatchCard';
import type { GroupStandingsProps } from '@organisms/GroupStandings';
import type { RankingEntry, TodayMatchBet } from '@organisms/RankingsTable';
import { getLocalizedName, type Locale, type LocalizedName } from '@utils/i18n';

import { TOURNAMENT_ID } from '../config/tournament';
import type { GroupStandings, Match, Team } from '../types/firestore';
import { getDb } from './firebase';
import { fetchRankingsFromApi } from './rankings-api';

async function getTeamsMap(): Promise<Map<string, Team>> {
  const snapshot = await getDocs(collection(getDb(), 'tournaments', TOURNAMENT_ID, 'teams'));
  const map = new Map<string, Team>();
  snapshot.docs.forEach((d) => {
    const team = d.data() as Team;
    map.set(team.fifaCode.toLowerCase(), team);
  });
  return map;
}

const TBD_NAME: LocalizedName = { es: 'TBD', en: 'TBD' };

// Defensive read for the migration window: production data may still have
// legacy `name: string` until pnpm seed is re-run. Strict helper remains the
// contract for new code; this is a build-time compatibility shim only.
function readTeamName(name: LocalizedName | string | undefined, locale: Locale): string {
  if (name == null) return '';
  if (typeof name === 'string') return name;
  return getLocalizedName(name, locale);
}

function toMatchCardProps(
  match: Match & { id: string },
  teams: Map<string, Team>,
  locale: Locale,
): MatchCardProps {
  const homeTeam = match.homeTeamId
    ? teams.get(match.homeTeamId.toLowerCase()) || {
        fifaCode: match.homeTeamId.toUpperCase(),
        name: {
          es: match.homeTeamId.toUpperCase(),
          en: match.homeTeamId.toUpperCase(),
        } satisfies LocalizedName,
      }
    : { fifaCode: 'TBD', name: TBD_NAME };

  const awayTeam = match.awayTeamId
    ? teams.get(match.awayTeamId.toLowerCase()) || {
        fifaCode: match.awayTeamId.toUpperCase(),
        name: {
          es: match.awayTeamId.toUpperCase(),
          en: match.awayTeamId.toUpperCase(),
        } satisfies LocalizedName,
      }
    : { fifaCode: 'TBD', name: TBD_NAME };

  return {
    homeTeam: {
      fifaCode: homeTeam.fifaCode,
      name: readTeamName(homeTeam.name, locale),
    },
    awayTeam: {
      fifaCode: awayTeam.fifaCode,
      name: readTeamName(awayTeam.name, locale),
    },
    // Knockout slot label shown when the team isn't decided yet.
    homePlaceholder: match.homeTeamId ? undefined : match.tbdHome,
    awayPlaceholder: match.awayTeamId ? undefined : match.tbdAway,
    date: match.date.toDate(),
    status: match.status,
    stadium: match.stadium,
    result:
      match.result.home !== null && match.result.away !== null
        ? { home: match.result.home, away: match.result.away }
        : undefined,
    translations: {
      scheduled: 'Scheduled',
      live: 'Live',
      finished: 'Finished',
      postponed: 'Postponed',
      cancelled: 'Cancelled',
      vs: 'VS',
    },
  };
}

export async function fetchLiveMatches(
  limit = 5,
  locale: Locale = 'en',
): Promise<MatchCardProps[]> {
  const teams = await getTeamsMap();
  const q = query(collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches'), orderBy('date'));
  const snapshot = await getDocs(q);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const allMatches = snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as Match & { id: string },
  );

  const todayMatches = allMatches.filter((m) => {
    const d = m.date.toDate();
    return d >= todayStart && d < todayEnd;
  });

  const upcomingMatches = allMatches
    .filter((m) => m.date.toDate() >= now && m.status === 'scheduled')
    .sort((a, b) => a.date.toMillis() - b.date.toMillis());

  const displayMatches = todayMatches.length > 0 ? todayMatches : upcomingMatches;
  return displayMatches.slice(0, limit).map((m) => toMatchCardProps(m, teams, locale));
}

export async function fetchAllMatches(locale: Locale = 'en'): Promise<MatchCardProps[]> {
  const teams = await getTeamsMap();
  const q = query(collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches'), orderBy('date'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => ({ ...d.data(), id: d.id }) as Match & { id: string })
    .map((m) => toMatchCardProps(m, teams, locale));
}

export async function fetchLiveStandings(
  locale: Locale = 'en',
): Promise<GroupStandingsProps['groups']> {
  const teams = await getTeamsMap();
  const snapshot = await getDocs(
    collection(getDb(), 'tournaments', TOURNAMENT_ID, 'group_standings'),
  );

  const groupsMap = new Map<string, { name: string; order: number }>();
  const groupsSnapshot = await getDocs(
    query(collection(getDb(), 'tournaments', TOURNAMENT_ID, 'groups'), orderBy('order')),
  );
  groupsSnapshot.docs.forEach((d) => {
    const data = d.data() as { slug: string; name: string; order: number };
    groupsMap.set(d.id, { name: data.name, order: data.order ?? 999 });
  });

  const groupsOrderMap = new Map<string, number>();
  groupsSnapshot.docs.forEach((d) => {
    const data = d.data() as { slug: string; name: string; order: number };
    groupsOrderMap.set(data.name, data.order ?? 999);
  });

  const standings: GroupStandingsProps['groups'] = snapshot.docs.map((d) => {
    const data = d.data() as GroupStandings;
    const group = groupsMap.get(data.groupId);
    return {
      name: group?.name || data.groupId,
      standings: data.standings.map((s, idx) => {
        const team = teams.get(s.teamId.toLowerCase());
        return {
          teamId: s.teamId,
          fifaCode: team?.fifaCode || s.teamId.toUpperCase(),
          teamName: team ? readTeamName(team.name, locale) : s.teamId.toUpperCase(),
          position: s.position ?? idx + 1,
          played: s.played,
          won: s.won,
          drawn: s.drawn,
          lost: s.lost,
          goalsFor: s.goalsFor,
          goalsAgainst: s.goalsAgainst,
          points: s.points,
        };
      }),
    };
  });

  return standings.sort((a, b) => {
    const aOrder = groupsOrderMap.get(a.name) ?? 999;
    const bOrder = groupsOrderMap.get(b.name) ?? 999;
    return aOrder - bOrder;
  });
}

const RANKINGS_SNAPSHOT_KEY = 'quiniela_rankings_snapshot';

function loadPreviousRankings(): Map<string, number> {
  try {
    const stored = localStorage.getItem(RANKINGS_SNAPSHOT_KEY);
    if (!stored) return new Map();
    const parsed = JSON.parse(stored) as [string, number][];
    return new Map(parsed);
  } catch {
    return new Map();
  }
}

function storeRankingsSnapshot(entries: { predictorId: string; position: number }[]): void {
  try {
    // Key on predictorId, not userId: one account can have multiple predictors in
    // the top-100, and a userId key would collapse them (last-write-wins) and yield
    // wrong rank-change arrows. predictorId is the unique ranking-row identity.
    const data: [string, number][] = entries.map((e) => [e.predictorId, e.position]);
    localStorage.setItem(RANKINGS_SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable
  }
}

function computeRankChange(
  index: number,
  predictorId: string,
  prevMap: Map<string, number>,
): 'up' | 'down' | 'same' | undefined {
  const prevPos = prevMap.get(predictorId);
  if (prevPos == null) return undefined;
  if (prevPos < index + 1) return 'down';
  if (prevPos > index + 1) return 'up';
  return 'same';
}

async function fetchTodayBets(): Promise<{
  matchList: TodayMatchBet[];
  predictorBets: Map<string, TodayMatchBet[]>;
}> {
  try {
    const teams = await getTeamsMap();
    const matchesRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches');
    const matchesSnap = await getDocs(matchesRef);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayMatchIds: string[] = [];
    const todayMatches = new Map<
      string,
      {
        homeTeam: string;
        awayTeam: string;
        status: string;
        actualHome?: number;
        actualAway?: number;
      }
    >();

    for (const doc of matchesSnap.docs) {
      const data = doc.data() as Match;
      const matchDate = data.date.toDate();
      if (matchDate >= todayStart && matchDate < todayEnd) {
        todayMatchIds.push(doc.id);
        const home = data.homeTeamId
          ? (teams.get(data.homeTeamId.toLowerCase())?.fifaCode ?? data.homeTeamId.toUpperCase())
          : 'TBD';
        const away = data.awayTeamId
          ? (teams.get(data.awayTeamId.toLowerCase())?.fifaCode ?? data.awayTeamId.toUpperCase())
          : 'TBD';
        todayMatches.set(doc.id, {
          homeTeam: home,
          awayTeam: away,
          status: data.status,
          actualHome: data.result.home ?? undefined,
          actualAway: data.result.away ?? undefined,
        });
      }
    }

    if (todayMatchIds.length === 0) {
      return { matchList: [], predictorBets: new Map() };
    }

    const betsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'bets');
    const betsQuery = query(betsRef, where('matchId', 'in', todayMatchIds));
    const betsSnap = await getDocs(betsQuery);

    const predictorBets = new Map<string, TodayMatchBet[]>();
    const matchList: TodayMatchBet[] = [];

    for (const todayId of todayMatchIds) {
      const info = todayMatches.get(todayId)!;
      matchList.push({
        matchId: todayId,
        homeTeam: info.homeTeam,
        awayTeam: info.awayTeam,
        homeScore: 0,
        awayScore: 0,
        status: info.status,
        actualHome: info.actualHome,
        actualAway: info.actualAway,
      });
    }

    for (const doc of betsSnap.docs) {
      const bet = doc.data() as {
        matchId: string;
        predictorId: string;
        homeScore: number;
        awayScore: number;
        isExact?: boolean;
        isWinner?: boolean;
      };
      const info = todayMatches.get(bet.matchId);
      if (!info) continue;

      const entry: TodayMatchBet = {
        matchId: bet.matchId,
        homeTeam: info.homeTeam,
        awayTeam: info.awayTeam,
        homeScore: bet.homeScore,
        awayScore: bet.awayScore,
        status: info.status,
        actualHome: info.actualHome,
        actualAway: info.actualAway,
        isExact: bet.isExact,
        isWinner: bet.isWinner,
      };

      const existing = predictorBets.get(bet.predictorId) || [];
      existing.push(entry);
      predictorBets.set(bet.predictorId, existing);
    }

    return { matchList, predictorBets };
  } catch {
    return { matchList: [], predictorBets: new Map() };
  }
}

export async function fetchLiveRankings(limit = 100): Promise<RankingEntry[]> {
  // Heavy work (collectionGroup stats scan + per-predictor profile reads) runs
  // server-side in the cached `/api/rankings` function. On any failure we return
  // an empty array; useLiveData keeps the server-rendered initial rankings.
  // In dev, `/api/rankings` is a Cloud Function that isn't running locally
  // (no emulator is wired up), so the client fetch would 404. Skip the call
  // and rely on the SSR data from getBuildRankings, which is fresh enough
  // for a dev session.
  if (import.meta.env.DEV) {
    return [];
  }
  let apiStats;
  try {
    apiStats = await fetchRankingsFromApi();
  } catch {
    return [];
  }

  const sorted = apiStats.slice(0, limit);

  const [prevRankings, todayBets] = await Promise.all([
    Promise.resolve(loadPreviousRankings()),
    fetchTodayBets(),
  ]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const entries: RankingEntry[] = sorted.map((s, index) => {
    const todayPoints =
      s.pointsHistory?.reduce((sum, entry) => {
        const entryDate = new Date(entry.timestamp);
        if (entryDate >= todayStart && entryDate < todayEnd) {
          return sum + entry.points;
        }
        return sum;
      }, 0) ?? undefined;

    return {
      userId: s.userId,
      predictorId: s.predictorId,
      displayName: s.displayName || s.predictorId,
      avatarUrl: s.avatarUrl || undefined,
      avatar: s.avatar || undefined,
      pixelArt: s.pixelArt ?? undefined,
      points: s.totalPoints,
      todayPoints,
      accuracy: Math.round(s.accuracy * 100),
      streak: s.currentStreak,
      badges: s.badgesAwarded ?? undefined,
      rankChange: computeRankChange(index, s.predictorId, prevRankings),
      todayMatchBets: todayBets.predictorBets.get(s.predictorId),
    };
  });

  // Map over `sorted` (ApiRankingEntry, predictorId is required) rather than `entries`
  // (view model, predictorId optional) — 1:1 in order, so positions are identical.
  storeRankingsSnapshot(sorted.map((s, i) => ({ predictorId: s.predictorId, position: i + 1 })));

  return entries;
}
