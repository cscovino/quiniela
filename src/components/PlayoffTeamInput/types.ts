import { Countries } from '@/types';

export interface PlayoffTeamInputProps {
  team: Countries;
  teamSelected: Countries | undefined;
  onClick: (team: Countries) => void;
  fontSize?: number;
  flagSize?: number;
  reverse?: boolean;
}
