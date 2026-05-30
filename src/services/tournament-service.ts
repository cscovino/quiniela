import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type QueryConstraint,
  where,
} from 'firebase/firestore';

import { TOURNAMENT_ID } from '../config/tournament';
import type {
  Group,
  GroupStandings,
  Match,
  PredictorStats,
  Team,
  Tournament,
} from '../types/firestore';
import { getDb } from './firebase';
import { fetchRankingsFromApi } from './rankings-api';

const db = () => getDb();

export const tournamentService = {
  getTournament: async (): Promise<Tournament | null> => {
    const docRef = doc(db(), 'tournaments', TOURNAMENT_ID);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as Tournament) : null;
  },

  getGroups: async (): Promise<Group[]> => {
    const q = query(collection(db(), 'tournaments', TOURNAMENT_ID, 'groups'), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as Group);
  },

  getTeams: async (): Promise<Team[]> => {
    const snapshot = await getDocs(collection(db(), 'tournaments', TOURNAMENT_ID, 'teams'));
    return snapshot.docs.map((d) => d.data() as Team);
  },

  getMatches: async (filters?: {
    phase?: string;
    groupId?: string;
    status?: string;
  }): Promise<Match[]> => {
    const constraints: QueryConstraint[] = [orderBy('date')];
    if (filters?.phase) constraints.push(where('phase', '==', filters.phase));
    if (filters?.groupId) constraints.push(where('groupId', '==', filters.groupId));
    const q = query(collection(db(), 'tournaments', TOURNAMENT_ID, 'matches'), ...constraints);
    const snapshot = await getDocs(q);
    const matches = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Match & { id: string });
    if (filters?.status) {
      return matches.filter((m) => m.status === filters.status);
    }
    return matches;
  },

  getGroupStandings: async (): Promise<GroupStandings[]> => {
    const snapshot = await getDocs(
      collection(db(), 'tournaments', TOURNAMENT_ID, 'group_standings'),
    );
    return snapshot.docs.map((d) => d.data() as GroupStandings);
  },

  getPredictorStats: async (
    userId: string,
    predictorId: string,
  ): Promise<PredictorStats | null> => {
    const docRef = doc(db(), 'users', userId, 'predictors', predictorId, 'stats', TOURNAMENT_ID);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as PredictorStats) : null;
  },

  getAllPredictorStats: async (): Promise<
    (PredictorStats & { userId: string; predictorId: string })[]
  > => {
    // Routed through the cached `/api/rankings` function (Admin SDK) instead of a
    // client `collectionGroup('stats')` query, which Firestore rules don't permit
    // and which incurred N+1 reads. Results are already sorted by totalPoints desc.
    const apiStats = await fetchRankingsFromApi();
    return apiStats.map(
      (s) =>
        ({
          userId: s.userId,
          predictorId: s.predictorId,
          totalPoints: s.totalPoints,
          accuracy: s.accuracy,
          currentStreak: s.currentStreak,
          exactBets: s.exactBets,
          badgesAwarded: s.badgesAwarded,
          pointsHistory: s.pointsHistory,
        }) as unknown as PredictorStats & { userId: string; predictorId: string },
    );
  },
};
