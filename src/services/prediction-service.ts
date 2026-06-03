import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { TOURNAMENT_ID } from '../config/tournament';
import type {
  BestPlayersBet,
  FinalPhaseBet,
  GroupBet,
  KnockoutBet,
  Match,
  MatchBet,
} from '../types/firestore';
import { getDb, isAppCheckError } from './firebase';

interface BetValidationResult {
  valid: boolean;
  reason?: string;
}

const validateMatchBet = async (
  matchId: string,
  userId: string,
  predictorId: string,
): Promise<BetValidationResult> => {
  const matchRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'matches', matchId);
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
  const existingBetRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'bets', betId);
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
  const matchRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'matches', matchId);
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
  const existingBetRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);
  const existingBetSnap = await getDoc(existingBetRef);

  if (existingBetSnap.exists()) {
    return { valid: false, reason: 'Already predicted this match' };
  }

  return { valid: true };
};

// Returns true if any match in the group has already kicked off (live/finished),
// in which case group rankings may no longer be submitted/changed.
const hasGroupStarted = async (groupId: string): Promise<boolean> => {
  const matchesRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches');
  const q = query(matchesRef, where('groupId', '==', groupId));
  const matchesSnap = await getDocs(q);
  return matchesSnap.docs.some((matchDoc) => {
    const match = matchDoc.data() as Match;
    return match.status === 'live' || match.status === 'finished';
  });
};

const validateGroupBet = async (
  groupId: string,
  userId: string,
  predictorId: string,
): Promise<BetValidationResult> => {
  if (await hasGroupStarted(groupId)) {
    return { valid: false, reason: 'A match in this group has already started' };
  }

  const betId = `${predictorId}-${groupId}`;
  const existingBetRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'group_bets', betId);
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

      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'bets', betId);
      await setDoc(
        betRef,
        {
          ...betData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (err) {
      if (isAppCheckError(err)) {
        return { success: false, error: 'CAPTCHA_ERROR' };
      }
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

      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);
      await setDoc(
        betRef,
        {
          ...betData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (err) {
      if (isAppCheckError(err)) {
        return { success: false, error: 'CAPTCHA_ERROR' };
      }
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

      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'group_bets', betId);
      await setDoc(
        betRef,
        {
          ...betData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (err) {
      if (isAppCheckError(err)) {
        return { success: false, error: 'CAPTCHA_ERROR' };
      }
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

    const batch = writeBatch(getDb());

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
        const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'bets', betId);

        batch.set(
          betRef,
          {
            userId,
            predictorId,
            matchId,
            homeScore: prediction.home,
            awayScore: prediction.away,
            points: 0,
            isExact: false,
            isWinner: false,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        if (!prediction.winner) {
          continue;
        }

        const betId = `${predictorId}-${matchId}`;
        const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);

        batch.set(
          betRef,
          {
            userId,
            predictorId,
            matchId,
            predictedWinner: prediction.winner,
            points: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      successCount++;
    }

    try {
      if (successCount > 0) {
        await batch.commit();
      }
      return { successCount, errorCount, errors };
    } catch (err) {
      if (isAppCheckError(err)) {
        return {
          successCount: 0,
          errorCount: Object.keys(predictions).length,
          errors: ['CAPTCHA_ERROR'],
        };
      }
      return {
        successCount: 0,
        errorCount: Object.keys(predictions).length,
        errors: [err instanceof Error ? err.message : 'Failed to submit predictions'],
      };
    }
  },

  submitBatchGroupBets: async (
    userId: string,
    predictorId: string,
    predictions: Record<string, string[]>,
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let successCount = 0;

    const batch = writeBatch(getDb());

    for (const [groupId, positions] of Object.entries(predictions)) {
      if (!positions || positions.length !== 4) {
        errors.push(`Group ${groupId} must have exactly 4 teams ranked`);
        continue;
      }

      // Mirror the single-submission deadline guard: reject groups whose matches
      // have already started so the batch path can't bypass validation.
      if (await hasGroupStarted(groupId)) {
        errors.push(`A match in group ${groupId} has already started`);
        continue;
      }

      const betId = `${predictorId}-${groupId}`;
      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'group_bets', betId);

      batch.set(
        betRef,
        {
          userId,
          predictorId,
          groupId,
          positions,
          points: 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      successCount++;
    }

    try {
      if (successCount > 0) {
        await batch.commit();
      }
      return { successCount, errorCount: errors.length, errors };
    } catch (err) {
      if (isAppCheckError(err)) {
        return {
          successCount: 0,
          errorCount: Object.keys(predictions).length,
          errors: ['CAPTCHA_ERROR'],
        };
      }
      return {
        successCount: 0,
        errorCount: Object.keys(predictions).length,
        errors: [err instanceof Error ? err.message : 'Failed to submit group predictions'],
      };
    }
  },

  submitBatchKnockoutBets: async (
    userId: string,
    predictorId: string,
    predictions: Record<string, string>,
    matches: (Match & { id: string })[],
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    const errors: string[] = [];
    let successCount = 0;

    const batch = writeBatch(getDb());

    for (const [matchSlug, winner] of Object.entries(predictions)) {
      const match = matches.find((m) => m.id === matchSlug || m.slug === matchSlug);
      if (!match) {
        errors.push(`Match ${matchSlug} not found`);
        continue;
      }

      if (match.status === 'finished' || match.status === 'live') {
        continue;
      }

      if (match.predictionDeadline && match.predictionDeadline.toDate() < new Date()) {
        continue;
      }

      if (!match.homeTeamId || !match.awayTeamId) {
        continue;
      }

      const betId = `${predictorId}-${matchSlug}`;
      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'knockout_bets', betId);

      batch.set(
        betRef,
        {
          userId,
          predictorId,
          matchId: matchSlug,
          predictedWinner: winner,
          points: 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      successCount++;
    }

    try {
      if (successCount > 0) {
        await batch.commit();
      }
      return { successCount, errorCount: errors.length, errors };
    } catch (err) {
      if (isAppCheckError(err)) {
        return {
          successCount: 0,
          errorCount: Object.keys(predictions).length,
          errors: ['CAPTCHA_ERROR'],
        };
      }
      return {
        successCount: 0,
        errorCount: Object.keys(predictions).length,
        errors: [err instanceof Error ? err.message : 'Failed to submit knockout predictions'],
      };
    }
  },

  submitFinalPhaseBet: async (
    userId: string,
    predictorId: string,
    data: { first: string; second: string; third: string; fourth: string },
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { first, second, third, fourth } = data;
      if (!first || !second || !third || !fourth) {
        return { success: false, error: 'All four positions must be filled' };
      }

      const uniqueTeams = new Set([first, second, third, fourth]);
      if (uniqueTeams.size !== 4) {
        return { success: false, error: 'All teams must be unique' };
      }

      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'final_phase_bets', predictorId);
      const betData: Omit<FinalPhaseBet, 'createdAt' | 'updatedAt'> = {
        userId,
        predictorId,
        first,
        second,
        third,
        fourth,
        points: 0,
      };

      await setDoc(
        betRef,
        {
          ...betData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (err) {
      if (isAppCheckError(err)) {
        return { success: false, error: 'CAPTCHA_ERROR' };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit final phase prediction',
      };
    }
  },

  submitBestPlayersBet: async (
    userId: string,
    predictorId: string,
    data: { bestGoalkeeper: string; bestScorer: string },
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { bestGoalkeeper, bestScorer } = data;
      if (!bestGoalkeeper || !bestScorer) {
        return { success: false, error: 'Both goalkeeper and scorer must be selected' };
      }

      const betRef = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'best_players_bets', predictorId);
      const betData: Omit<BestPlayersBet, 'createdAt' | 'updatedAt'> = {
        userId,
        predictorId,
        bestGoalkeeper,
        bestScorer,
        points: 0,
      };

      await setDoc(
        betRef,
        {
          ...betData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (err) {
      if (isAppCheckError(err)) {
        return { success: false, error: 'CAPTCHA_ERROR' };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit best players prediction',
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
    finalPhase: FinalPhaseBet | null;
    bestPlayers: BestPlayersBet | null;
  }> => {
    const matchBets = new Map<string, { home: number; away: number }>();
    const knockoutBets = new Map<string, string>();
    const groupBets = new Map<string, string[]>();

    const matchBetsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'bets');
    const matchBetsQuery = query(matchBetsRef, where('predictorId', '==', predictorId));
    const matchBetsSnap = await getDocs(matchBetsQuery);

    for (const docSnap of matchBetsSnap.docs) {
      const bet = docSnap.data() as MatchBet;
      if (bet.userId === userId) {
        matchBets.set(bet.matchId, { home: bet.homeScore, away: bet.awayScore });
      }
    }

    const knockoutBetsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'knockout_bets');
    const knockoutBetsQuery = query(knockoutBetsRef, where('predictorId', '==', predictorId));
    const knockoutBetsSnap = await getDocs(knockoutBetsQuery);

    for (const docSnap of knockoutBetsSnap.docs) {
      const bet = docSnap.data() as KnockoutBet;
      if (bet.userId === userId) {
        knockoutBets.set(bet.matchId, bet.predictedWinner);
      }
    }

    const groupBetsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'group_bets');
    const groupBetsQuery = query(groupBetsRef, where('predictorId', '==', predictorId));
    const groupBetsSnap = await getDocs(groupBetsQuery);

    for (const docSnap of groupBetsSnap.docs) {
      const bet = docSnap.data() as GroupBet;
      if (bet.userId === userId) {
        groupBets.set(bet.groupId, bet.positions);
      }
    }

    let finalPhase: FinalPhaseBet | null = null;
    try {
      const finalPhaseRef = doc(
        getDb(),
        'tournaments',
        TOURNAMENT_ID,
        'final_phase_bets',
        predictorId,
      );
      const finalPhaseSnap = await getDoc(finalPhaseRef);
      if (finalPhaseSnap.exists()) {
        const data = finalPhaseSnap.data() as FinalPhaseBet;
        if (data.userId === userId) {
          finalPhase = data;
        }
      }
    } catch {
      // Collection may not exist yet
    }

    let bestPlayers: BestPlayersBet | null = null;
    try {
      const bestPlayersRef = doc(
        getDb(),
        'tournaments',
        TOURNAMENT_ID,
        'best_players_bets',
        predictorId,
      );
      const bestPlayersSnap = await getDoc(bestPlayersRef);
      if (bestPlayersSnap.exists()) {
        const data = bestPlayersSnap.data() as BestPlayersBet;
        if (data.userId === userId) {
          bestPlayers = data;
        }
      }
    } catch {
      // Collection may not exist yet
    }

    return { matchBets, knockoutBets, groupBets, finalPhase, bestPlayers };
  },
};
