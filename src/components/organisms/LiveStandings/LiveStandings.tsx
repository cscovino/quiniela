import React from 'react';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import { useLiveData } from '@hooks/useLiveData';
import { fetchLiveStandings } from '@services/live-data-service';

export interface LiveStandingsProps extends Omit<GroupStandingsProps, 'groups'> {
  initialGroups: GroupStandingsProps['groups'];
  cacheKey?: string;
}

export const LiveStandings: React.FC<LiveStandingsProps> = ({
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
