import { Countries, GroupsNames } from '@/types';

export interface PositionProps {
  teams: Array<Countries>;
  first: Countries;
  second: Countries;
  group: GroupsNames;
}
