import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import type { MatchStatus } from '../types/firestore';
import { getDb } from './firebase';

export const updateMatchResult = async (
  tournamentId: string,
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): Promise<void> => {
  const matchRef = doc(getDb(), 'tournaments', tournamentId, 'matches', matchId);

  const scoresAllowedForStatus = status === 'finished' || status === 'live';
  const scoresProvided = homeScore !== null && awayScore !== null;

  const updateData: {
    status: MatchStatus;
    updatedAt: ReturnType<typeof serverTimestamp>;
    result: { home: number | null; away: number | null };
  } = {
    status,
    updatedAt: serverTimestamp(),
    result:
      scoresAllowedForStatus && scoresProvided
        ? { home: homeScore, away: awayScore }
        : { home: null, away: null },
  };

  await updateDoc(matchRef, updateData);
};
