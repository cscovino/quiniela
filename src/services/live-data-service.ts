import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import type { MatchCardProps } from '@molecules/MatchCard';
import type { GroupStandingsProps } from '@organisms/GroupStandings';
import type { RankingEntry, TodayMatchBet } from '@organisms/RankingsTable';

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

function toMatchCardProps(match: Match & { id: string }, teams: Map<string, Team>): MatchCardProps {
  const homeTeam = match.homeTeamId
    ? teams.get(match.homeTeamId.toLowerCase()) || {
        fifaCode: match.homeTeamId.toUpperCase(),
        name: match.homeTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };

  const awayTeam = match.awayTeamId
    ? teams.get(match.awayTeamId.toLowerCase()) || {
        fifaCode: match.awayTeamId.toUpperCase(),
        name: match.awayTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };

  return {
    id: match.id,
    slug: match.slug,
    homeTeam: {
      fifaCode: homeTeam.fifaCode,
      name: homeTeam.name,
    },
    awayTeam: {
      fifaCode: awayTeam.fifaCode,
      name: awayTeam.name,
    },
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

export async function fetchLiveMatches(limit = 5): Promise<MatchCardProps[]> {
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
  return displayMatches.slice(0, limit).map((m) => toMatchCardProps(m, teams));
}

export async function fetchAllMatches(): Promise<MatchCardProps[]> {
  const teams = await getTeamsMap();
  const q = query(collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches'), orderBy('date'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => ({ ...d.data(), id: d.id }) as Match & { id: string })
    .map((m) => toMatchCardProps(m, teams));
}

export async function fetchLiveStandings(): Promise<GroupStandingsProps['groups']> {
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
      standings: data.standings.map((s, idx) => ({
        teamId: s.teamId,
        fifaCode: teams.get(s.teamId.toLowerCase())?.fifaCode || s.teamId.toUpperCase(),
        teamName: teams.get(s.teamId.toLowerCase())?.name || s.teamId.toUpperCase(),
        position: s.position ?? idx + 1,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        points: s.points,
      })),
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

function storeRankingsSnapshot(entries: { userId: string; position: number }[]): void {
  try {
    const data: [string, number][] = entries.map((e) => [e.userId, e.position]);
    localStorage.setItem(RANKINGS_SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable
  }
}

function computeRankChange(
  index: number,
  userId: string,
  prevMap: Map<string, number>,
): 'up' | 'down' | 'same' | undefined {
  const prevPos = prevMap.get(userId);
  if (prevPos == null) return undefined;
  if (prevPos < index + 1) return 'down';
  if (prevPos > index + 1) return 'up';
  return 'same';
}

async function fetchPredictionsCounts(predictorIds: string[]): Promise<Map<string, number>> {
  if (predictorIds.length === 0) return new Map();
  try {
    const matchesRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches');
    const matchesSnap = await getDocs(matchesRef);
    const now = new Date();
    const futureMatchIds = matchesSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as { id: string; date: { toDate: () => Date } })
      .filter((d) => d.date.toDate() > now)
      .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
      .slice(0, 6)
      .map((d) => d.id);

    if (futureMatchIds.length === 0) return new Map();

    const betsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'bets');
    const betsQuery = query(betsRef, where('matchId', 'in', futureMatchIds));
    const betsSnap = await getDocs(betsQuery);

    const counts = new Map<string, number>();
    for (const doc of betsSnap.docs) {
      const bet = doc.data() as { predictorId: string };
      counts.set(bet.predictorId, (counts.get(bet.predictorId) || 0) + 1);
    }

    return counts;
  } catch {
    return new Map();
  }
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
  let apiStats;
  try {
    apiStats = await fetchRankingsFromApi();
  } catch {
    return [];
  }

  const sorted = apiStats.slice(0, limit);

  const predictorIds = sorted.map((s) => s.predictorId);
  const [predictionsCounts, prevRankings, todayBets] = await Promise.all([
    fetchPredictionsCounts(predictorIds),
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
      points: s.totalPoints,
      todayPoints,
      accuracy: Math.round(s.accuracy * 100),
      streak: s.currentStreak,
      badges: s.badgesAwarded ?? undefined,
      rankChange: computeRankChange(index, s.userId, prevRankings),
      predictionsCount: predictionsCounts.get(s.predictorId) ?? 0,
      todayMatchBets: todayBets.predictorBets.get(s.predictorId),
    };
  });

  storeRankingsSnapshot(entries.map((e, i) => ({ userId: e.userId, position: i + 1 })));

  return entries;
}
