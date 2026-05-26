import { getFirestore } from './firebase-admin';
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

interface GroupData {
  slug: string;
  name: string;
  order: number;
}

export async function getBuildData() {
  if (import.meta.env.DEV) {
    return { matches: [], standings: [], teams: {}, allMatches: [] };
  }

  const db = getFirestore();

  try {
    const [teamsSnap, matchesSnap, standingsSnap, groupsSnap] = await Promise.all([
      db.collection(`tournaments/${TOURNAMENT_ID}/teams`).get(),
      db.collection(`tournaments/${TOURNAMENT_ID}/matches`).orderBy('date').get(),
      db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get(),
      db.collection(`tournaments/${TOURNAMENT_ID}/groups`).get(),
    ]);

    const teams: Record<string, TeamData> = {};
    teamsSnap.forEach((doc) => {
      const data = doc.data() as TeamData;
      teams[data.fifaCode.toLowerCase()] = data;
    });

    // groups: keyed by doc.id (the slug used as groupId in teams)
    const groupsMap = new Map<string, GroupData>();
    groupsSnap.forEach((doc) => {
      const data = doc.data() as Partial<GroupData>;
      groupsMap.set(doc.id, {
        slug: data.slug || doc.id,
        name: data.name || doc.id,
        order: data.order ?? 999,
      });
    });

    const rawMatches = matchesSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as (MatchData & { id: string })[];

    type MatchView = {
      homeTeam: { fifaCode: string; name: string };
      awayTeam: { fifaCode: string; name: string };
      date: Date;
      status: string;
      stadium: string;
      result?: { home: number; away: number };
    };

    function toViewModel(m: MatchData & { id: string }): MatchView {
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
    }

    // Full ordered list (already sorted by Firestore `orderBy('date')`)
    const allMatches: MatchView[] = rawMatches.map(toViewModel);

    // Home-page subset: today's matches OR next 5 upcoming
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayMatches = rawMatches.filter((m) => {
      const d = m.date.toDate();
      return d >= todayStart && d < todayEnd;
    });

    const upcomingMatches = rawMatches
      .filter((m) => m.date.toDate() >= now && m.status === 'scheduled')
      .sort((a, b) => a.date.toMillis() - b.date.toMillis())
      .slice(0, 5);

    const displayMatches = todayMatches.length > 0 ? todayMatches : upcomingMatches;
    const matches: MatchView[] = displayMatches.slice(0, 5).map(toViewModel);

    type StandingsRow = GroupStandingsProps['groups'][number];
    type StandingsRowWithOrder = StandingsRow & { __order: number };

    let standings: StandingsRowWithOrder[] = standingsSnap.docs.map((doc) => {
      const data = doc.data() as StandingData;
      const group = groupsMap.get(data.groupId);
      return {
        name: group?.name || data.groupId,
        __order: group?.order ?? 999,
        standings: data.standings.map((s, idx) => ({
          teamId: s.teamId,
          fifaCode: teams[s.teamId.toLowerCase()]?.fifaCode || s.teamId.toUpperCase(),
          teamName: teams[s.teamId.toLowerCase()]?.name || s.teamId.toUpperCase(),
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

    // Fallback: synthesize zero-state standings from teams grouped by groupId
    // when the standings collection is empty (e.g., before any match results).
    // Teams.groupId references the group document id (slug, e.g. "group-a").
    if (standings.length === 0) {
      const byGroup = new Map<string, StandingsRow['standings']>();
      for (const team of Object.values(teams)) {
        if (!team.groupId) continue;
        if (!byGroup.has(team.groupId)) byGroup.set(team.groupId, []);
        byGroup.get(team.groupId)!.push({
          teamId: team.fifaCode,
          fifaCode: team.fifaCode,
          teamName: team.name,
          position: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }
      standings = Array.from(byGroup.entries()).map(([groupId, teamsInGroup]) => {
        const group = groupsMap.get(groupId);
        return {
          name: group?.name || groupId,
          __order: group?.order ?? 999,
          standings: teamsInGroup
            .sort((a, b) => a.teamName.localeCompare(b.teamName))
            .map((s, idx) => ({ ...s, position: idx + 1 })),
        };
      });
    }

    // Sort groups by the canonical `order` field (Grupo A < B < C < ...)
    standings.sort((a, b) => a.__order - b.__order);
    const standingsOut: GroupStandingsProps['groups'] = standings.map((s) => ({
      name: s.name,
      standings: s.standings,
    }));

    return { matches, standings: standingsOut, teams, allMatches };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[build-data] getBuildData failed, returning empty data:', error);
    return { matches: [], standings: [], teams: {}, allMatches: [] };
  }
}

export async function getBuildRankings() {
  if (import.meta.env.DEV) {
    return [];
  }

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
        const data = snap.exists ? snap.data() : null;
        return {
          id: ref,
          name: data?.name || null,
          avatar: data?.avatar || null,
          avatarUrl: data?.avatarUrl || null,
        };
      }),
    );

    const nameMap = new Map<string, string>();
    const avatarMap = new Map<string, { bgColor?: string; emoji?: string; avatarUrl?: string }>();
    for (const p of predictorDocs) {
      nameMap.set(p.id, p.name || p.id.split('/').pop() || 'Unknown');
      avatarMap.set(p.id, {
        bgColor: p.avatar?.bgColor,
        emoji: p.avatar?.emoji,
        avatarUrl: p.avatarUrl,
      });
    }

    const rankings: RankingsTableProps['rankings'] = sorted.map((s) => {
      const key = `users/${s.userId}/predictors/${s.predictorId}`;
      const avatarData = avatarMap.get(key);
      return {
        userId: s.userId,
        predictorId: s.predictorId,
        displayName: nameMap.get(key) || s.predictorId,
        avatarUrl: avatarData?.avatarUrl,
        avatar:
          avatarData?.bgColor && avatarData?.emoji
            ? { bgColor: avatarData.bgColor, emoji: avatarData.emoji }
            : undefined,
        points: s.totalPoints,
        accuracy: Math.round(s.accuracy * 100),
        streak: s.currentStreak,
      };
    });

    return rankings;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[build-data] getBuildRankings failed, returning empty array:', error);
    return [];
  }
}
