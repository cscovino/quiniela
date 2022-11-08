import { SubmitHandler } from 'react-hook-form';
import { QuerySnapshot } from 'firebase/firestore';

import { GroupStageValues, GroupInfo } from '@/types';

export interface FormProps {
  onSubmit: SubmitHandler<GroupStageValues>;
  data: QuerySnapshot<GroupInfo>;
}
