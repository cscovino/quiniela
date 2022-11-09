import { SubmitHandler } from 'react-hook-form';

import { FinalPositions } from '@/types';

export interface ModalFormProps {
  isOpen: boolean;
  finalPositions: FinalPositions;
  buttonIsDisabled: boolean;
  onSubmit: SubmitHandler<{ participant: string; scorer: string }>;
  onClose: () => void;
}
