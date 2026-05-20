import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Tournament,
  Group,
  Team,
  Match,
  GroupStandings,
  PredictorStats,
} from '../types/firestore';

const TOURNAMENT_ID = 'world-cup-2026';

export const tournamentService = {
  getTournament: async (): Promise<Tournament | null> => {
    const docRef = doc(db, 'tournaments', TOURNAMENT_ID);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as Tournament) : null;
  },

  getGroups: async (): Promise<Group[]> => {
    const q = query(collection(db, 'tournaments', TOURNAMENT_ID, 'groups'), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as Group);
  },

  getTeams: async (): Promise<Team[]> => {
    const snapshot = await getDocs(collection(db, 'tournaments', TOURNAMENT_ID, 'teams'));
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
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    const q = query(collection(db, 'tournaments', TOURNAMENT_ID, 'matches'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Match & { id: string });
  },

  getGroupStandings: async (): Promise<GroupStandings[]> => {
    const snapshot = await getDocs(collection(db, 'tournaments', TOURNAMENT_ID, 'group_standings'));
    return snapshot.docs.map((d) => d.data() as GroupStandings);
  },

  getPredictorStats: async (
    userId: string,
    predictorId: string,
  ): Promise<PredictorStats | null> => {
    const docRef = doc(db, 'users', userId, 'predictors', predictorId, 'stats', TOURNAMENT_ID);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as PredictorStats) : null;
  },

  getAllPredictorStats: async (
    tournamentId: string = TOURNAMENT_ID,
  ): Promise<(PredictorStats & { userId: string; predictorId: string })[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allStats: (PredictorStats & { userId: string; predictorId: string })[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const predictorsSnapshot = await getDocs(collection(db, 'users', userId, 'predictors'));

      for (const predictorDoc of predictorsSnapshot.docs) {
        const predictorId = predictorDoc.id;
        const statsRef = doc(db, 'users', userId, 'predictors', predictorId, 'stats', tournamentId);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          allStats.push({
            ...(statsDoc.data() as PredictorStats),
            userId,
            predictorId,
          });
        }
      }
    }

    return allStats.sort((a, b) => b.totalPoints - a.totalPoints);
  },
};
