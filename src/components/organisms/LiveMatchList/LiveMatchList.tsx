import type { FC } from 'react';

import { useLiveData } from '@hooks/useLiveData';
import type { MatchCardProps } from '@molecules/MatchCard';
import { SkeletonMatchCard } from '@molecules/SkeletonMatchCard';
import { MatchList, type MatchListProps } from '@organisms/MatchList';
import { fetchAllMatches, fetchLiveMatches } from '@services/live-data-service';

export interface LiveMatchListProps extends Omit<MatchListProps, 'matches'> {
  initialMatches: MatchCardProps[];
  cacheKey?: string;
  limit?: number;
  showAll?: boolean;
}

export const LiveMatchList: FC<LiveMatchListProps> = ({
  initialMatches,
  cacheKey = 'live-matches',
  limit = 5,
  showAll = false,
  ...rest
}) => {
  const fetcher = showAll ? fetchAllMatches : () => fetchLiveMatches(limit);

  const { data: matches, loading } = useLiveData<MatchCardProps[]>(
    cacheKey,
    fetcher,
    initialMatches,
  );

  if (loading && matches.length === 0) {
    return (
      <div className="match-list">
        <div className="match-list__items">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonMatchCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return <MatchList matches={matches} {...rest} />;
};
