import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
import { SkeletonRankings } from '@molecules/SkeletonRankings';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable';
import { fetchLiveRankings } from '@services/live-data-service';

export interface LiveRankingsProps extends Omit<RankingsTableProps, 'rankings'> {
  initialRankings: RankingsTableProps['rankings'];
  cacheKey?: string;
}

export const LiveRankings: FC<LiveRankingsProps> = ({
  initialRankings,
  cacheKey = 'live-rankings',
  ...rest
}) => {
  const { data: rankings, loading } = useLiveData<RankingsTableProps['rankings']>(
    cacheKey,
    () => fetchLiveRankings(100),
    initialRankings,
  );

  if (loading && rankings.length === 0) {
    return <SkeletonRankings />;
  }

  return <RankingsTable rankings={rankings} {...rest} />;
};
