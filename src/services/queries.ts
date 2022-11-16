import { collection, CollectionReference, query } from 'firebase/firestore';

import { firestore } from '@/configs/firebase';
import { ActualResults, GroupInfo, ParticipantResult, PlayoffsInfo } from '@/types';

export const queryGroups = query(collection(firestore, 'groups') as CollectionReference<GroupInfo>);

export const queryPlayoffs = query(
  collection(firestore, 'playoffs') as CollectionReference<PlayoffsInfo>,
);

export const queryParticipantsResults = query(
  collection(firestore, 'participants') as CollectionReference<ParticipantResult>,
);
export const queryActualResults = query(
  collection(firestore, 'results') as CollectionReference<ActualResults>,
);
