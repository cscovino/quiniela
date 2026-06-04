import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { SkeletonRankings } from '@molecules/SkeletonRankings';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable';
import { fetchLiveRankings } from '@services/live-data-service';

export interface LiveRankingsProps extends Omit<RankingsTableProps, 'rankings'> {
  initialRankings: RankingsTableProps['rankings'];
}

export const LiveRankings: FC<LiveRankingsProps> = ({ initialRankings, ...rest }) => {
  const [rankings, setRankings] = useState<RankingsTableProps['rankings']>(initialRankings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLiveRankings(100)
      .then((data) => {
        if (cancelled) return;
        if (data.length > 0) setRankings(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && rankings.length === 0) {
    return <SkeletonRankings />;
  }

  return <RankingsTable rankings={rankings} {...rest} />;
};
