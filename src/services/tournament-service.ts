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
    const q = query(collection(db, 'tournaments', TOURNAMENT_ID, 'matches'), ...constraints);
    const snapshot = await getDocs(q);
    const matches = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Match & { id: string });
    if (filters?.status) {
      return matches.filter((m) => m.status === filters.status);
    }
    return matches;
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
    const { collectionGroup, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const statsRef = collectionGroup(db, 'stats');
    const q = query(statsRef, where('__name__', '==', tournamentId));

    const snapshot = await getDocs(q);

    const allStats: (PredictorStats & { userId: string; predictorId: string })[] = [];

    for (const doc of snapshot.docs) {
      const refPath = doc.ref.path;
      const pathParts = refPath.split('/');

      const userId = pathParts[1];
      const predictorId = pathParts[3];

      allStats.push({
        ...(doc.data() as PredictorStats),
        userId,
        predictorId,
      });
    }

    return allStats.sort((a, b) => b.totalPoints - a.totalPoints);
  },
};
