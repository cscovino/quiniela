import { MouseEventHandler } from 'react';

import { Countries } from '@/types';

export interface PlayoffTeamInputProps {
  team: Countries;
  teamSelected: Countries | undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
  fontSize?: number;
  flagSize?: number;
  reverse?: boolean;
}
