import React, { useEffect, useState } from 'react';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { rankingsService } from '@services/rankings-service';

export type LiveRankingsProps = RankingsTableProps;

export const LiveRankings: React.FC<LiveRankingsProps> = ({
  rankings: initialRankings,
  ...rest
}) => {
  const [rankings, setRankings] = useState(initialRankings);

  useEffect(() => {
    let cancelled = false;
    async function fetchLive() {
      try {
        const allStats = await rankingsService.getAllPredictorStats();
        if (cancelled) return;

        const top = allStats.slice(0, 100);
        const mapped = top.map((s) => ({
          userId: s.userId,
          predictorId: s.predictorId,
          displayName: s.predictorId,
          points: s.totalPoints,
          accuracy: Math.round(s.accuracy * 100),
          streak: s.currentStreak,
        }));

        setRankings(mapped as RankingsTableProps['rankings']);
      } catch {
        // Keep build-time data as fallback
      }
    }
    fetchLive();
    return () => {
      cancelled = true;
    };
  }, []);

  return <RankingsTable {...rest} rankings={rankings} />;
};
