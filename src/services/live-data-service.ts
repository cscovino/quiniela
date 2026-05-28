import { collection, collectionGroup, getDocs, orderBy, query, where } from 'firebase/firestore';

import type { MatchCardProps } from '@molecules/MatchCard';
import type { GroupStandingsProps } from '@organisms/GroupStandings';
import type { RankingEntry } from '@organisms/RankingsTable';

import { TOURNAMENT_ID } from '../config/tournament';
import type { GroupStandings, Match, PredictorStats, Team } from '../types/firestore';
import { getDb } from './firebase';

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
    const aOrder = groupsMap.get(a.name)?.order ?? 999;
    const bOrder = groupsMap.get(b.name)?.order ?? 999;
    return aOrder - bOrder;
  });
}

export async function fetchLiveRankings(limit = 100): Promise<RankingEntry[]> {
  const statsRef = collectionGroup(getDb(), 'stats');
  const q = query(statsRef, where('__name__', '==', TOURNAMENT_ID));
  const snapshot = await getDocs(q);

  const allStats: (PredictorStats & { userId: string; predictorId: string })[] = [];
  for (const doc of snapshot.docs) {
    const refPath = doc.ref.path;
    const pathParts = refPath.split('/');
    allStats.push({
      ...(doc.data() as PredictorStats),
      userId: pathParts[1],
      predictorId: pathParts[3],
    });
  }

  const sorted = allStats.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);

  const predictorRefs = new Set<string>();
  for (const s of sorted) {
    predictorRefs.add(`users/${s.userId}/predictors/${s.predictorId}`);
  }

  const predictorDocs = await Promise.all(
    Array.from(predictorRefs).map(async (ref) => {
      const { getDoc, doc: firestoreDoc } = await import('firebase/firestore');
      const snap = await getDoc(firestoreDoc(getDb(), ref));
      const data = snap.exists() ? snap.data() : null;
      return {
        id: ref,
        name: (data?.name as string) || null,
        avatarUrl: (data?.avatarUrl as string | null) || null,
      };
    }),
  );

  const nameMap = new Map<string, string>();
  const avatarUrlMap = new Map<string, string | null>();
  for (const p of predictorDocs) {
    nameMap.set(p.id, p.name || p.id.split('/').pop() || 'Unknown');
    avatarUrlMap.set(p.id, p.avatarUrl);
  }

  return sorted.map((s) => {
    const key = `users/${s.userId}/predictors/${s.predictorId}`;
    return {
      userId: s.userId,
      predictorId: s.predictorId,
      displayName: nameMap.get(key) || s.predictorId,
      avatarUrl: avatarUrlMap.get(key) || undefined,
      points: s.totalPoints,
      accuracy: Math.round(s.accuracy * 100),
      streak: s.currentStreak,
    };
  });
}
