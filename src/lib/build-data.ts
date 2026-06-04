import type { GroupStandingsProps } from '@organisms/GroupStandings';
import type { RankingsTableProps } from '@organisms/RankingsTable';
import { getLocalizedName, type Locale, type LocalizedName } from '@utils/i18n';

import { TOURNAMENT_ID } from '../config/tournament';

interface TeamData {
  fifaCode: string;
  name: LocalizedName;
  groupId: string;
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
  tbdHome?: string;
  tbdAway?: string;
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

interface RowDoc {
  id: string;
  data: () => Record<string, unknown>;
  exists: boolean;
}

interface QuerySnapshotLike {
  docs: RowDoc[];
  forEach: (cb: (doc: RowDoc) => void) => void;
}

type QueryOptions = { orderBy?: string };

interface DbClient {
  query: (path: string, opts?: QueryOptions) => Promise<QuerySnapshotLike>;
  doc: (path: string) => Promise<RowDoc>;
  collectionGroup: (id: string) => Promise<QuerySnapshotLike>;
}

async function createAdminDb(): Promise<DbClient> {
  const { getFirestore } = await import('./firebase-admin');
  const db = getFirestore();
  return {
    query: async (path: string, opts?: QueryOptions): Promise<QuerySnapshotLike> => {
      let ref: ReturnType<typeof db.collection> = db.collection(path);
      if (opts?.orderBy) ref = ref.orderBy(opts.orderBy);
      return ref.get();
    },
    doc: async (path: string): Promise<RowDoc> => {
      return db.doc(path).get();
    },
    collectionGroup: async (id: string): Promise<QuerySnapshotLike> => {
      return db.collectionGroup(id).get();
    },
  };
}

async function createWebDb(): Promise<DbClient> {
  const { getApp, getApps, initializeApp } = await import('firebase/app');
  const f = await import('firebase/firestore');
  const { getPublicFirebaseConfig } = await import('../config/firebase-config');
  // Use a dedicated NAMED app so build-time fetching never collides with the
  // runtime default app ("Firebase App named '[DEFAULT]' already exists"), and
  // reuse the shared config so it can't drift from src/services/firebase.ts.
  const BUILD_APP_NAME = 'build-web';
  const app = getApps().some((a) => a.name === BUILD_APP_NAME)
    ? getApp(BUILD_APP_NAME)
    : initializeApp(getPublicFirebaseConfig(), BUILD_APP_NAME);
  const db = f.getFirestore(app);
  return {
    query: async (path: string, opts?: QueryOptions): Promise<QuerySnapshotLike> => {
      const ref = f.collection(db, path);
      const snap = opts?.orderBy
        ? await f.getDocs(f.query(ref, f.orderBy(opts.orderBy)))
        : await f.getDocs(ref);
      return snap as unknown as QuerySnapshotLike;
    },
    doc: async (path: string): Promise<RowDoc> => {
      return f.getDoc(f.doc(db, path)) as unknown as Promise<RowDoc>;
    },
    collectionGroup: async (id: string): Promise<QuerySnapshotLike> => {
      return f.getDocs(f.collectionGroup(db, id)) as unknown as Promise<QuerySnapshotLike>;
    },
  };
}

function toTeamsMap(teamsSnap: QuerySnapshotLike): Record<string, TeamData> {
  const teams: Record<string, TeamData> = {};
  teamsSnap.forEach((doc) => {
    const data = doc.data() as TeamData;
    teams[data.fifaCode.toLowerCase()] = data;
  });
  return teams;
}

function toGroupsMap(groupsSnap: QuerySnapshotLike): Map<string, GroupData> {
  const groupsMap = new Map<string, GroupData>();
  groupsSnap.forEach((doc) => {
    const data = doc.data() as Partial<GroupData>;
    groupsMap.set(doc.id, {
      slug: data.slug || doc.id,
      name: data.name || doc.id,
      order: data.order ?? 999,
    });
  });
  return groupsMap;
}

function rawMatchesFromSnap(matchesSnap: QuerySnapshotLike): (MatchData & { id: string })[] {
  return matchesSnap.docs.map((doc) => ({
    ...(doc.data() as MatchData),
    id: doc.id,
  }));
}

type MatchView = {
  homeTeam: { fifaCode: string; name: string };
  awayTeam: { fifaCode: string; name: string };
  homePlaceholder?: string;
  awayPlaceholder?: string;
  date: Date;
  status: string;
  stadium: string;
  result?: { home: number; away: number };
};

function toMatchView(
  m: MatchData & { id: string },
  teams: Record<string, TeamData>,
  locale: Locale,
): MatchView {
  const homeTeam = m.homeTeamId
    ? teams[m.homeTeamId.toLowerCase()] || {
        fifaCode: m.homeTeamId.toUpperCase(),
        name: {
          es: m.homeTeamId.toUpperCase(),
          en: m.homeTeamId.toUpperCase(),
        } satisfies LocalizedName,
      }
    : { fifaCode: 'TBD', name: TBD_NAME };
  const awayTeam = m.awayTeamId
    ? teams[m.awayTeamId.toLowerCase()] || {
        fifaCode: m.awayTeamId.toUpperCase(),
        name: {
          es: m.awayTeamId.toUpperCase(),
          en: m.awayTeamId.toUpperCase(),
        } satisfies LocalizedName,
      }
    : { fifaCode: 'TBD', name: TBD_NAME };
  const result =
    m.result.home !== null && m.result.away !== null
      ? { home: m.result.home, away: m.result.away }
      : undefined;
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
    homePlaceholder: m.homeTeamId ? undefined : m.tbdHome,
    awayPlaceholder: m.awayTeamId ? undefined : m.tbdAway,
    date: m.date.toDate(),
    status: m.status,
    stadium: m.stadium,
    result,
  };
}

function buildStandings(
  standingsSnap: QuerySnapshotLike,
  groupsMap: Map<string, GroupData>,
  teams: Record<string, TeamData>,
  locale: Locale,
): GroupStandingsProps['groups'] {
  type StandingsRow = GroupStandingsProps['groups'][number];
  type StandingsRowWithOrder = StandingsRow & { __order: number };

  let standings: StandingsRowWithOrder[] = standingsSnap.docs.map((doc) => {
    const data = doc.data() as StandingData;
    const group = groupsMap.get(data.groupId);
    return {
      name: group?.name || data.groupId,
      __order: group?.order ?? 999,
      standings: data.standings.map((s, idx) => {
        const team = teams[s.teamId.toLowerCase()];
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

  if (standings.length === 0) {
    const byGroup = new Map<string, StandingsRow['standings']>();
    for (const team of Object.values(teams)) {
      if (!team.groupId) continue;
      if (!byGroup.has(team.groupId)) byGroup.set(team.groupId, []);
      byGroup.get(team.groupId)!.push({
        teamId: team.fifaCode,
        fifaCode: team.fifaCode,
        teamName: readTeamName(team.name, locale),
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

  standings.sort((a, b) => a.__order - b.__order);
  return standings.map((s) => ({ name: s.name, standings: s.standings }));
}

async function queryBuildData(db: DbClient, locale: Locale) {
  const [teamsSnap, matchesSnap, standingsSnap, groupsSnap, tournamentSnap] = await Promise.all([
    db.query(`tournaments/${TOURNAMENT_ID}/teams`),
    db.query(`tournaments/${TOURNAMENT_ID}/matches`, { orderBy: 'date' }),
    db.query(`tournaments/${TOURNAMENT_ID}/group_standings`),
    db.query(`tournaments/${TOURNAMENT_ID}/groups`),
    db.doc(`tournaments/${TOURNAMENT_ID}`),
  ]);

  const teams = toTeamsMap(teamsSnap);
  const groupsMap = toGroupsMap(groupsSnap);
  const rawMatches = rawMatchesFromSnap(matchesSnap);

  const rawTournament = tournamentSnap.exists ? tournamentSnap.data() : {};
  const tournament = {
    startDate:
      (rawTournament.startDate as { toDate: () => Date })?.toDate?.() || new Date('2026-06-11'),
    endDate:
      (rawTournament.endDate as { toDate: () => Date })?.toDate?.() || new Date('2026-07-19'),
    status: (rawTournament.status as string) || 'active',
    participantCount: Object.keys(teams).length,
  };

  const allMatches: MatchView[] = rawMatches.map((m) => toMatchView(m, teams, locale));

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
  const matches: MatchView[] = displayMatches.slice(0, 5).map((m) => toMatchView(m, teams, locale));

  const standings = buildStandings(standingsSnap, groupsMap, teams, locale);

  return { matches, standings, teams, allMatches, tournament };
}

async function queryBuildRankings(db: DbClient) {
  const statsSnap = await db.collectionGroup('stats');

  const allStats: Array<PredictorStatsData & { userId: string; predictorId: string }> = [];

  statsSnap.forEach((doc) => {
    const refPath = (doc as unknown as { ref: { path: string } }).ref.path;
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
      const snap = await db.doc(ref);
      const data = snap.exists ? snap.data() : null;
      return {
        id: ref,
        name: (data?.name as string) || null,
        avatar: (data?.avatar as { bgColor?: string; emoji?: string } | null) || null,
        avatarUrl: (data?.avatarUrl as string | null) || null,
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
}

export async function getBuildData(locale: Locale = 'en') {
  const errors: unknown[] = [];

  for (const create of [createAdminDb, createWebDb]) {
    try {
      const db = await create();
      return await queryBuildData(db, locale);
    } catch (e) {
      errors.push(e);
    }
  }

  // eslint-disable-next-line no-console
  console.warn('[build-data] getBuildData failed, returning empty:', errors);
  return {
    matches: [],
    standings: [],
    teams: {},
    allMatches: [],
    tournament: {
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      status: 'active',
      participantCount: 0,
    },
  };
}

export async function getBuildRankings() {
  const errors: unknown[] = [];

  for (const create of [createAdminDb, createWebDb]) {
    try {
      const db = await create();
      return await queryBuildRankings(db);
    } catch (e) {
      errors.push(e);
    }
  }

  // eslint-disable-next-line no-console
  console.warn('[build-data] getBuildRankings failed, returning empty:', errors);
  return [];
}
