import { Countries } from '@/types';

export interface TeamInputProps {
  team: Countries;
  inputLabel: string;
  fontSize?: number;
  flagSize?: number;
  reverse?: boolean;
}
