import React, { useEffect, useState } from 'react';
import { MatchList, type MatchListProps } from '@organisms/MatchList/MatchList';
import { tournamentService } from '@services/tournament-service';
import type { Team } from '@app-types/firestore';

export interface LiveMatchListProps extends MatchListProps {
  max?: number;
}

export const LiveMatchList: React.FC<LiveMatchListProps> = ({ max, ...matchListProps }) => {
  const [matches, setMatches] = useState(matchListProps.matches);

  useEffect(() => {
    let cancelled = false;
    async function fetchLive() {
      try {
        const [allMatches, teams] = await Promise.all([
          tournamentService.getMatches(),
          tournamentService.getTeams(),
        ]);
        if (cancelled) return;

        const teamsMap: Record<string, Team> = {};
        teams.forEach((t) => {
          teamsMap[t.fifaCode.toLowerCase()] = t;
          teamsMap[t.fifaCode] = t;
        });

        function resolveTeam(teamId: string | null) {
          if (!teamId) return 'TBD';
          const team = teamsMap[teamId.toLowerCase()];
          return team?.fifaCode || teamId.toUpperCase();
        }

        function resolveName(teamId: string | null) {
          if (!teamId) return 'TBD';
          const team = teamsMap[teamId.toLowerCase()];
          return team?.name || teamId;
        }

        const transformed = allMatches.map((m) => ({
          homeTeam: {
            fifaCode: resolveTeam(m.homeTeamId),
            name: resolveName(m.homeTeamId),
          },
          awayTeam: {
            fifaCode: resolveTeam(m.awayTeamId),
            name: resolveName(m.awayTeamId),
          },
          date: m.date.toDate(),
          status: m.status,
          stadium: m.stadium,
          result:
            m.result.home !== null && m.result.away !== null
              ? { home: m.result.home, away: m.result.away }
              : undefined,
        }));

        if (max) {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          const todayMatches = transformed.filter((m) => m.date >= todayStart && m.date < todayEnd);
          if (todayMatches.length > 0) {
            setMatches(todayMatches.slice(0, max));
          } else {
            const upcoming = transformed
              .filter((m) => m.date >= now && m.status === 'scheduled')
              .slice(0, max);
            setMatches(upcoming.length > 0 ? upcoming : transformed.slice(0, max));
          }
        } else {
          setMatches(transformed);
        }
      } catch {
        // Keep build-time data as fallback
      }
    }
    fetchLive();
    return () => {
      cancelled = true;
    };
  }, [max]);

  return <MatchList {...matchListProps} matches={matches} />;
};
