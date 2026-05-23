import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from './firebase';
import type { MatchStatus } from '../types/firestore';

export const updateMatchResult = async (
  tournamentId: string,
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): Promise<void> => {
  const matchRef = doc(getDb(), 'tournaments', tournamentId, 'matches', matchId);

  const updateData: {
    status: MatchStatus;
    updatedAt: ReturnType<typeof serverTimestamp>;
    result: { home: number | null; away: number | null };
  } = {
    status,
    updatedAt: serverTimestamp(),
    result:
      status === 'finished' && homeScore !== null && awayScore !== null
        ? { home: homeScore, away: awayScore }
        : { home: null, away: null },
  };

  await updateDoc(matchRef, updateData);
};
