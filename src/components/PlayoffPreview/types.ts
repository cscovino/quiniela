import { Countries } from '@/types';

export interface PlayoffsMatchPreviewProps {
  team: Countries;
  position: string;
  fontSize?: number;
  flagSize?: number;
  reverse?: boolean;
}
