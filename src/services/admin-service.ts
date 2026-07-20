import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import type { MatchStatus } from '../types/firestore';
import { getDb } from './firebase';

export const updateMatchResult = async (
  tournamentId: string,
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
  penaltyResult?: { home: number; away: number } | null,
): Promise<void> => {
  const matchRef = doc(getDb(), 'tournaments', tournamentId, 'matches', matchId);

  const scoresAllowedForStatus = status === 'finished' || status === 'live';
  const scoresProvided = homeScore !== null && awayScore !== null;

  const updateData: {
    status: MatchStatus;
    updatedAt: ReturnType<typeof serverTimestamp>;
    result: { home: number | null; away: number | null };
    penaltyResult?: { home: number; away: number } | null;
  } = {
    status,
    updatedAt: serverTimestamp(),
    result:
      scoresAllowedForStatus && scoresProvided
        ? { home: homeScore, away: awayScore }
        : { home: null, away: null },
  };

  if (penaltyResult !== undefined) {
    updateData.penaltyResult = penaltyResult;
  }

  await updateDoc(matchRef, updateData);
};

export const setBestPlayersResult = async (
  tournamentId: string,
  topScorer: string,
  bestGoalkeeper: string,
): Promise<void> => {
  const ref = doc(getDb(), 'tournaments', tournamentId, 'best_players_results', 'actual');
  await setDoc(ref, {
    topScorer,
    bestGoalkeeper,
    tournamentId,
    pointsCalculated: false,
    updatedAt: serverTimestamp(),
  });
};
