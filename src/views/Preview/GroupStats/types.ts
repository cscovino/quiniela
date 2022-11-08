import { SubmitHandler } from 'react-hook-form';
import { QuerySnapshot } from 'firebase/firestore';

import { GroupInfo, GroupsClasifications, GroupsStats } from '@/types';

export interface GroupStatsProps {
  onSubmit: SubmitHandler<GroupsClasifications>;
  data: QuerySnapshot<GroupInfo>;
  stats: GroupsStats;
}
