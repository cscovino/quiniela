import React from 'react';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { useLiveData } from '@hooks/useLiveData';
import { fetchLiveRankings } from '@services/live-data-service';

export interface LiveRankingsProps extends Omit<RankingsTableProps, 'rankings'> {
  initialRankings: RankingsTableProps['rankings'];
  cacheKey?: string;
}

export const LiveRankings: React.FC<LiveRankingsProps> = ({
  initialRankings,
  cacheKey = 'live-rankings',
  ...rest
}) => {
  const { data: rankings } = useLiveData<RankingsTableProps['rankings']>(
    cacheKey,
    () => fetchLiveRankings(100),
    initialRankings,
  );

  return <RankingsTable rankings={rankings} {...rest} />;
};
