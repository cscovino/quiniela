import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings';
import { fetchLiveStandings } from '@services/live-data-service';

export interface LiveStandingsProps extends Omit<GroupStandingsProps, 'groups'> {
  initialGroups: GroupStandingsProps['groups'];
  cacheKey?: string;
}

export const LiveStandings: FC<LiveStandingsProps> = ({
  initialGroups,
  cacheKey = 'live-standings',
  ...rest
}) => {
  const { data: groups } = useLiveData<GroupStandingsProps['groups']>(
    cacheKey,
    fetchLiveStandings,
    initialGroups,
  );

  return <GroupStandings groups={groups} {...rest} />;
};
