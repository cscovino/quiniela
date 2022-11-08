import { Timestamp } from 'firebase/firestore';

import { Countries, GroupsNames } from '@/types';

export interface MatchProps {
  teams: Array<Countries>;
  group: GroupsNames;
  date: Timestamp;
}
