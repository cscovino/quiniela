import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
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
  const { data: rankings } = useLiveData<RankingsTableProps['rankings']>(
    cacheKey,
    () => fetchLiveRankings(100),
    initialRankings,
  );

  return <RankingsTable rankings={rankings} {...rest} />;
};
