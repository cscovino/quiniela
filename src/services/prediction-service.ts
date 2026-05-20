import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MatchBet, KnockoutBet, GroupBet, Match } from '../types/firestore';

const TOURNAMENT_ID = 'world-cup-2026';

interface BetValidationResult {
  valid: boolean;
  reason?: string;
}

const validateMatchBet = async (
  matchId: string,
  userId: string,
  predictorId: string,
): Promise<BetValidationResult> => {
  const matchRef = doc(db, 'tournaments', TOURNAMENT_ID, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) {
    return { valid: false, reason: 'Match not found' };
  }

  const match = matchSnap.data() as Match;

  if (match.status === 'finished' || match.status === 'live') {
    return { valid: false, reason: 'Match already started or finished' };
  }

  if (match.predictionDeadline && match.predictionDeadline.toDate() < new Date()) {
    return { valid: false, reason: 'Prediction deadline has passed' };
  }

  const betId = `${predictorId}-${matchId}`;
  const existingBetRef = doc(db, 'tournaments', TOURNAMENT_ID, 'bets', betId);
  const existingBetSnap = await getDoc(existingBetRef);

  if (existingBetSnap.exists()) {
    return { valid: false, reason: 'Already predicted this match' };
  }

  return { valid: true };
};

const validateKnockoutBet = async (
  matchId: string,
  userId: string,
  predictorId: string,
): Promise<BetValidationResult> => {
  const matchRef = doc(db, 'tournaments', TOURNAMENT_ID, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) {
    return { valid: false, reason: 'Match not found' };
  }

  const match = matchSnap.data() as Match;

  if (match.status === 'finished' || match.status === 'live') {
    return { valid: false, reason: 'Match already started or finished' };
  }

  if (match.predictionDeadline && match.predictionDeadline.toDate() < new Date()) {
    return { valid: false, reason: 'Prediction deadline has passed' };
  }

  if (!match.homeTeamId || !match.awayTeamId) {
    return { valid: false, reason: 'Teams are not yet determined' };
  }

  const betId = `${predictorId}-${matchId}`;
  const existingBetRef = doc(db, 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);
  const existingBetSnap = await getDoc(existingBetRef);

  if (existingBetSnap.exists()) {
    return { valid: false, reason: 'Already predicted this match' };
  }

  return { valid: true };
};

const validateGroupBet = async (
  groupId: string,
  userId: string,
  predictorId: string,
): Promise<BetValidationResult> => {
  const matchesRef = collection(db, 'tournaments', TOURNAMENT_ID, 'matches');
  const q = query(matchesRef, where('groupId', '==', groupId));
  const matchesSnap = await getDocs(q);

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data() as Match;
    if (match.status === 'live' || match.status === 'finished') {
      return { valid: false, reason: 'A match in this group has already started' };
    }
  }

  const betId = `${predictorId}-${groupId}`;
  const existingBetRef = doc(db, 'tournaments', TOURNAMENT_ID, 'group_bets', betId);
  const existingBetSnap = await getDoc(existingBetRef);

  if (existingBetSnap.exists()) {
    return { valid: false, reason: 'Already predicted this group' };
  }

  return { valid: true };
};

export const predictionService = {
  submitMatchBet: async (
    userId: string,
    predictorId: string,
    matchId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const validation = await validateMatchBet(matchId, userId, predictorId);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }

      const betId = `${predictorId}-${matchId}`;
      const betData: Omit<MatchBet, 'createdAt' | 'updatedAt'> = {
        userId,
        predictorId,
        matchId,
        homeScore,
        awayScore,
        points: 0,
        isExact: false,
        isWinner: false,
      };

      const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'bets', betId);
      await setDoc(betRef, {
        ...betData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit prediction',
      };
    }
  },

  submitKnockoutBet: async (
    userId: string,
    predictorId: string,
    matchId: string,
    predictedWinner: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const validation = await validateKnockoutBet(matchId, userId, predictorId);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }

      const betId = `${predictorId}-${matchId}`;
      const betData: Omit<KnockoutBet, 'createdAt'> = {
        userId,
        predictorId,
        matchId,
        predictedWinner,
        points: 0,
      };

      const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);
      await setDoc(betRef, {
        ...betData,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit prediction',
      };
    }
  },

  submitGroupBet: async (
    userId: string,
    predictorId: string,
    groupId: string,
    positions: string[],
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const validation = await validateGroupBet(groupId, userId, predictorId);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }

      const betId = `${predictorId}-${groupId}`;
      const betData: Omit<GroupBet, 'createdAt' | 'updatedAt'> = {
        userId,
        predictorId,
        groupId,
        positions,
        points: 0,
      };

      const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'group_bets', betId);
      await setDoc(betRef, {
        ...betData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit prediction',
      };
    }
  },

  submitBatchMatchBets: async (
    userId: string,
    predictorId: string,
    predictions: Record<string, { home?: number; away?: number; winner?: string }>,
    matches: (Match & { id: string })[],
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    const batch = writeBatch(db);

    for (const [matchId, prediction] of Object.entries(predictions)) {
      const match = matches.find((m) => m.id === matchId || m.slug === matchId);
      if (!match) {
        errors.push(`Match ${matchId} not found`);
        errorCount++;
        continue;
      }

      if (match.status === 'finished' || match.status === 'live') {
        continue;
      }

      if (match.predictionDeadline && match.predictionDeadline.toDate() < new Date()) {
        continue;
      }

      if (match.phase === 'group') {
        if (prediction.home === undefined || prediction.away === undefined) {
          continue;
        }

        const betId = `${predictorId}-${matchId}`;
        const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'bets', betId);

        batch.set(betRef, {
          userId,
          predictorId,
          matchId,
          homeScore: prediction.home,
          awayScore: prediction.away,
          points: 0,
          isExact: false,
          isWinner: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        if (!prediction.winner) {
          continue;
        }

        const betId = `${predictorId}-${matchId}`;
        const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);

        batch.set(betRef, {
          userId,
          predictorId,
          matchId,
          predictedWinner: prediction.winner,
          points: 0,
          createdAt: serverTimestamp(),
        });
      }

      successCount++;
    }

    try {
      if (successCount > 0) {
        await batch.commit();
      }
      return { successCount, errorCount, errors };
    } catch (err) {
      return {
        successCount: 0,
        errorCount: Object.keys(predictions).length,
        errors: [err instanceof Error ? err.message : 'Failed to submit predictions'],
      };
    }
  },

  getExistingBets: async (
    userId: string,
    predictorId: string,
  ): Promise<{
    matchBets: Map<string, { home: number; away: number }>;
    knockoutBets: Map<string, string>;
    groupBets: Map<string, string[]>;
  }> => {
    const matchBets = new Map<string, { home: number; away: number }>();
    const knockoutBets = new Map<string, string>();
    const groupBets = new Map<string, string[]>();

    const matchBetsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'bets');
    const matchBetsQuery = query(matchBetsRef, where('predictorId', '==', predictorId));
    const matchBetsSnap = await getDocs(matchBetsQuery);

    for (const docSnap of matchBetsSnap.docs) {
      const bet = docSnap.data() as MatchBet;
      if (bet.userId === userId) {
        matchBets.set(bet.matchId, { home: bet.homeScore, away: bet.awayScore });
      }
    }

    const knockoutBetsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'knockout_bets');
    const knockoutBetsQuery = query(knockoutBetsRef, where('predictorId', '==', predictorId));
    const knockoutBetsSnap = await getDocs(knockoutBetsQuery);

    for (const docSnap of knockoutBetsSnap.docs) {
      const bet = docSnap.data() as KnockoutBet;
      if (bet.userId === userId) {
        knockoutBets.set(bet.matchId, bet.predictedWinner);
      }
    }

    const groupBetsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'group_bets');
    const groupBetsQuery = query(groupBetsRef, where('predictorId', '==', predictorId));
    const groupBetsSnap = await getDocs(groupBetsQuery);

    for (const docSnap of groupBetsSnap.docs) {
      const bet = docSnap.data() as GroupBet;
      if (bet.userId === userId) {
        groupBets.set(bet.groupId, bet.positions);
      }
    }

    return { matchBets, knockoutBets, groupBets };
  },
};
