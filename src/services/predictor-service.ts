import {
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

import type { Predictor, PredictorStats } from '@app-types/firestore';
import {
  getPredictorProgress,
  type GroupBetRecord,
  type KnockoutBetRecord,
} from '@utils/predictions-flow';

import { TOURNAMENT_ID } from '../config/tournament';
import { getDb } from './firebase';
import { predictionService } from './prediction-service';
import { tournamentService } from './tournament-service';

const MAX_NAME_LENGTH = 40;
const BG_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

// Firestore caps a single writeBatch at 500 operations. Delete in chunks so a
// predictor with many bets can still be removed without the batch failing.
const FIRESTORE_BATCH_LIMIT = 500;

async function deleteRefsInChunks(
  db: Firestore,
  refs: DocumentReference<DocumentData>[],
): Promise<number> {
  for (let i = 0; i < refs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const ref of refs.slice(i, i + FIRESTORE_BATCH_LIMIT)) {
      batch.delete(ref);
    }
    await batch.commit();
  }
  return refs.length;
}

function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) return 'Name cannot be empty';
  if (name.length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or less`;
  return null;
}

function validateAvatar(avatar?: { bgColor?: string; emoji?: string }): string | null {
  if (!avatar) return null;
  if (avatar.bgColor && !BG_COLOR_REGEX.test(avatar.bgColor)) {
    return 'Invalid background color format';
  }
  if (avatar.emoji && [...avatar.emoji].length > 2) {
    return 'Emoji must be 2 graphemes or less';
  }
  return null;
}

export const predictorService = {
  async getUserPredictors(userId: string): Promise<Predictor[]> {
    const predictorsRef = collection(getDb(), 'users', userId, 'predictors');
    const snapshot = await getDocs(predictorsRef);
    return snapshot.docs.map((doc) => doc.data() as Predictor);
  },

  async createPredictor(
    userId: string,
    name: string,
    avatarUrl?: string,
    favouriteTeamId?: string,
  ): Promise<Predictor> {
    const nameError = validateName(name);
    if (nameError) throw new Error(nameError);

    const predictorId = `${userId}-${Date.now()}`;
    const predictor: Omit<Predictor, 'createdAt'> = {
      id: predictorId,
      userId,
      name,
      ...(avatarUrl && { avatarUrl }),
      ...(favouriteTeamId && { favouriteTeamId }),
    };

    await setDoc(doc(getDb(), 'users', userId, 'predictors', predictorId), {
      ...predictor,
      createdAt: serverTimestamp(),
    });

    return { ...predictor, createdAt: new Date() as unknown as Timestamp };
  },

  async getDefaultPredictor(userId: string): Promise<Predictor | null> {
    const predictorsRef = collection(getDb(), 'users', userId, 'predictors');
    const q = query(predictorsRef, where('id', '==', `${userId}-default`));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Predictor;
  },

  async updatePredictor(
    userId: string,
    predictorId: string,
    patch: {
      name?: string;
      avatar?: { bgColor: string; emoji: string };
      favouriteTeamId?: string | null;
    },
  ): Promise<void> {
    if (patch.name !== undefined) {
      const nameError = validateName(patch.name);
      if (nameError) throw new Error(nameError);
    }
    if (patch.avatar !== undefined) {
      const avatarError = validateAvatar(patch.avatar);
      if (avatarError) throw new Error(avatarError);
    }

    const ref = doc(getDb(), 'users', userId, 'predictors', predictorId);
    await setDoc(ref, patch, { merge: true });
  },

  async deletePredictor(
    userId: string,
    predictorId: string,
  ): Promise<{ deletedCounts: Record<string, number> }> {
    const db = getDb();
    const deletedCounts: Record<string, number> = {};

    // 1. bets where predictorId == …
    const betsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'bets');
    const betsQuery = query(betsRef, where('predictorId', '==', predictorId));
    const betsSnap = await getDocs(betsQuery);
    const betsDeleted = await deleteRefsInChunks(
      db,
      betsSnap.docs.map((d) => d.ref),
    );
    if (betsDeleted > 0) {
      deletedCounts.bets = betsDeleted;
    }

    // 2. group_bets where predictorId == …
    const groupBetsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'group_bets');
    const groupBetsQuery = query(groupBetsRef, where('predictorId', '==', predictorId));
    const groupBetsSnap = await getDocs(groupBetsQuery);
    const groupBetsDeleted = await deleteRefsInChunks(
      db,
      groupBetsSnap.docs.map((d) => d.ref),
    );
    if (groupBetsDeleted > 0) {
      deletedCounts.group_bets = groupBetsDeleted;
    }

    // 3. knockout_bets where predictorId == …
    const knockoutBetsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'knockout_bets');
    const knockoutBetsQuery = query(knockoutBetsRef, where('predictorId', '==', predictorId));
    const knockoutBetsSnap = await getDocs(knockoutBetsQuery);
    const knockoutBetsDeleted = await deleteRefsInChunks(
      db,
      knockoutBetsSnap.docs.map((d) => d.ref),
    );
    if (knockoutBetsDeleted > 0) {
      deletedCounts.knockout_bets = knockoutBetsDeleted;
    }

    // 4. final_phase_bets/{predictorId}
    const finalPhaseRef = doc(db, 'tournaments', TOURNAMENT_ID, 'final_phase_bets', predictorId);
    const finalPhaseSnap = await getDoc(finalPhaseRef);
    if (finalPhaseSnap.exists()) {
      await deleteDoc(finalPhaseRef);
      deletedCounts.final_phase_bets = 1;
    }

    // 5. best_players_bets/{predictorId}
    const bestPlayersRef = doc(db, 'tournaments', TOURNAMENT_ID, 'best_players_bets', predictorId);
    const bestPlayersSnap = await getDoc(bestPlayersRef);
    if (bestPlayersSnap.exists()) {
      await deleteDoc(bestPlayersRef);
      deletedCounts.best_players_bets = 1;
    }

    // 6. users/{uid}/predictors/{pid}/stats/{tid}
    const statsRef = doc(db, 'users', userId, 'predictors', predictorId, 'stats', TOURNAMENT_ID);
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      await deleteDoc(statsRef);
      deletedCounts.stats = 1;
    }

    // 7. users/{uid}/predictors/{pid}
    await deleteDoc(doc(db, 'users', userId, 'predictors', predictorId));

    return { deletedCounts };
  },

  async getUserPredictorsWithStats(
    userId: string,
    tournamentId: string = TOURNAMENT_ID,
  ): Promise<
    Array<
      Predictor & {
        stats: PredictorStats | null;
        progress: {
          groupsSubmitted: number;
          totalGroups: number;
          knockoutSubmitted: number;
          totalKnockout: number;
          finalSubmitted: boolean;
          bestPlayersSubmitted: boolean;
        };
      }
    >
  > {
    const predictors = await predictorService.getUserPredictors(userId);

    const results = await Promise.all(
      predictors.map(async (predictor) => {
        // Get stats
        let stats: PredictorStats | null = null;
        try {
          const statsRef = doc(
            getDb(),
            'users',
            userId,
            'predictors',
            predictor.id,
            'stats',
            tournamentId,
          );
          const statsSnap = await getDoc(statsRef);
          if (statsSnap.exists()) {
            stats = statsSnap.data() as PredictorStats;
          }
        } catch {
          // Stats collection may not exist
        }

        // Get progress
        const { groupBets, knockoutBets, finalPhase, bestPlayers } =
          await predictionService.getExistingBets(userId, predictor.id);

        // We need all matches to calculate total counts
        const allMatches = await tournamentService.getMatches();

        const groupBetsRecord: GroupBetRecord = {};
        groupBets.forEach((v, k) => {
          groupBetsRecord[k] = v;
        });
        const knockoutBetsRecord: KnockoutBetRecord = {};
        knockoutBets.forEach((v, k) => {
          knockoutBetsRecord[k] = v;
        });

        const progress = getPredictorProgress(
          allMatches.map((m) => ({ ...m, id: m.slug })),
          groupBetsRecord,
          knockoutBetsRecord,
          !!finalPhase,
          !!bestPlayers,
        );

        return { ...predictor, stats, progress };
      }),
    );

    return results;
  },
};
