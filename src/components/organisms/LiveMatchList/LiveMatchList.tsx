import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
import type { MatchCardProps } from '@molecules/MatchCard';
import { MatchList, type MatchListProps } from '@organisms/MatchList';
import { fetchLiveMatches } from '@services/live-data-service';

export interface LiveMatchListProps extends Omit<MatchListProps, 'matches'> {
  initialMatches: MatchCardProps[];
  cacheKey?: string;
  limit?: number;
}

export const LiveMatchList: FC<LiveMatchListProps> = ({
  initialMatches,
  cacheKey = 'live-matches',
  limit = 5,
  ...rest
}) => {
  const { data: matches } = useLiveData<MatchCardProps[]>(
    cacheKey,
    () => fetchLiveMatches(limit),
    initialMatches,
  );

  return <MatchList matches={matches} {...rest} />;
};
