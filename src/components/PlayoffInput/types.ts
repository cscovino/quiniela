import { Timestamp } from 'firebase/firestore';

import { Countries, FinalPositions } from '@/types';

export interface PlayoffsMatchProps {
  teams: Array<Countries>;
  match: string;
  date: Timestamp;
  setPlayoffsTeam: (match: string, team: Countries) => void;
  setFinalPosition: (position: keyof FinalPositions, team: Countries) => void;
}
