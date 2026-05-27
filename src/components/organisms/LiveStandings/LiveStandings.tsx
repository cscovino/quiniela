import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
import { SkeletonStandings } from '@molecules/SkeletonStandings';
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
  const { data: groups, loading } = useLiveData<GroupStandingsProps['groups']>(
    cacheKey,
    fetchLiveStandings,
    initialGroups,
  );

  if (loading && groups.length === 0) {
    return <SkeletonStandings />;
  }

  return <GroupStandings groups={groups} {...rest} />;
};
