import { getFirestore } from './firebase-admin';
import type { MatchListProps } from '@organisms/MatchList/MatchList';
import type { RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import type { GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';

const TOURNAMENT_ID = 'world-cup-2026';

interface TeamData {
  fifaCode: string;
  name: string;
  groupId: string;
}

interface MatchData {
  slug: string;
  phase: string;
  groupId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date: { toDate: () => Date; toMillis: () => number };
  stadium: string;
  result: { home: number | null; away: number | null };
  status: string;
  predictionDeadline: { toDate: () => Date };
  pointsCalculated?: boolean;
}

interface StandingData {
  groupId: string;
  standings: Array<{
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
  }>;
}

interface PredictorStatsData {
  totalPoints: number;
  accuracy: number;
  currentStreak: number;
  exactBets: number;
  predictorId: string;
}

export async function getBuildData() {
  const db = getFirestore();

  try {
    const [teamsSnap, matchesSnap, standingsSnap] = await Promise.all([
      db.collection(`tournaments/${TOURNAMENT_ID}/teams`).get(),
      db.collection(`tournaments/${TOURNAMENT_ID}/matches`).orderBy('date').get(),
      db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get(),
    ]);

    const teams: Record<string, TeamData> = {};
    teamsSnap.forEach((doc) => {
      const data = doc.data() as TeamData;
      teams[data.fifaCode.toLowerCase()] = data;
    });

    const allMatches = matchesSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as (MatchData & { id: string })[];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayMatches = allMatches.filter((m) => {
      const d = m.date.toDate();
      return d >= todayStart && d < todayEnd;
    });

    const upcomingMatches = allMatches
      .filter((m) => m.date.toDate() >= now && m.status === 'scheduled')
      .sort((a, b) => a.date.toMillis() - b.date.toMillis())
      .slice(0, 5);

    const displayMatches = todayMatches.length > 0 ? todayMatches : upcomingMatches;

    const matches: MatchListProps['matches'] = displayMatches.slice(0, 5).map((m) => {
      const homeTeam = m.homeTeamId
        ? teams[m.homeTeamId.toLowerCase()] || {
            fifaCode: m.homeTeamId.toUpperCase(),
            name: m.homeTeamId.toUpperCase(),
          }
        : { fifaCode: 'TBD', name: 'TBD' };
      const awayTeam = m.awayTeamId
        ? teams[m.awayTeamId.toLowerCase()] || {
            fifaCode: m.awayTeamId.toUpperCase(),
            name: m.awayTeamId.toUpperCase(),
          }
        : { fifaCode: 'TBD', name: 'TBD' };

      const result =
        m.result.home !== null && m.result.away !== null
          ? { home: m.result.home, away: m.result.away }
          : undefined;

      return {
        homeTeam,
        awayTeam,
        date: m.date.toDate(),
        status: m.status,
        stadium: m.stadium,
        result,
      };
    });

    const standings: GroupStandingsProps['groups'] = standingsSnap.docs.map((doc) => {
      const data = doc.data() as StandingData;
      return {
        name: data.groupId,
        standings: data.standings.map((s) => ({
          teamId: s.teamId,
          fifaCode: teams[s.teamId.toLowerCase()]?.fifaCode || s.teamId.toUpperCase(),
          teamName: teams[s.teamId.toLowerCase()]?.name || s.teamId.toUpperCase(),
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

    return { matches, standings, teams, allMatches };
  } catch (error) {
    console.warn('[build-data] getBuildData failed, returning empty data:', error);
    return { matches: [], standings: [], teams: {}, allMatches: [] };
  }
}

export async function getBuildRankings() {
  const db = getFirestore();

  try {
    const statsSnap = await db.collectionGroup('stats').get();

    const allStats: Array<PredictorStatsData & { userId: string; predictorId: string }> = [];

    statsSnap.forEach((doc) => {
      const refPath = doc.ref.path;
      const pathParts = refPath.split('/');
      const userId = pathParts[1];
      const predictorId = pathParts[3];
      allStats.push({ ...(doc.data() as PredictorStatsData), userId, predictorId });
    });

    const sorted = allStats.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 100);

    const predictorRefs = new Set<string>();
    for (const s of sorted) {
      predictorRefs.add(`users/${s.userId}/predictors/${s.predictorId}`);
    }

    const predictorDocs = await Promise.all(
      Array.from(predictorRefs).map(async (ref) => {
        const snap = await db.doc(ref).get();
        return { id: ref, name: snap.exists ? snap.data()?.name || null : null };
      }),
    );

    const nameMap = new Map<string, string>();
    for (const p of predictorDocs) {
      nameMap.set(p.id, p.name || p.id.split('/').pop() || 'Unknown');
    }

    const rankings: RankingsTableProps['rankings'] = sorted.map((s) => ({
      userId: s.userId,
      predictorId: s.predictorId,
      displayName: nameMap.get(`users/${s.userId}/predictors/${s.predictorId}`) || s.predictorId,
      points: s.totalPoints,
      accuracy: Math.round(s.accuracy * 100),
      streak: s.currentStreak,
    }));

    return rankings;
  } catch (error) {
    console.warn('[build-data] getBuildRankings failed, returning empty array:', error);
    return [];
  }
}
