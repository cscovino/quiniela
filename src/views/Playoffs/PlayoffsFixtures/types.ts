import { QuerySnapshot } from 'firebase/firestore';

import { PlayoffsInfo, GroupsClasifications } from '@/types';

export interface PlayoffsFixturesProps {
  data: QuerySnapshot<PlayoffsInfo>;
  groupsClasifications: GroupsClasifications;
}
