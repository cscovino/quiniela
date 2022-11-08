import { collection, CollectionReference, query } from 'firebase/firestore';

import { firestore } from '@/configs/firebase';
import { GroupInfo, PlayoffsInfo } from '@/types';

export const queryGroups = query(collection(firestore, 'groups') as CollectionReference<GroupInfo>);

export const queryPlayoffs = query(
  collection(firestore, 'playoffs') as CollectionReference<PlayoffsInfo>,
);
