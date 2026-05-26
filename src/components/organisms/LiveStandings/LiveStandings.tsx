import React, { useEffect, useState } from 'react';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import { tournamentService } from '@services/tournament-service';
import type { Team } from '@app-types/firestore';

export type LiveStandingsProps = GroupStandingsProps;

export const LiveStandings: React.FC<LiveStandingsProps> = ({ groups: initialGroups, ...rest }) => {
  const [groups, setGroups] = useState(initialGroups);

  useEffect(() => {
    let cancelled = false;
    async function fetchLive() {
      try {
        const [gs, teamsData, groupsData] = await Promise.all([
          tournamentService.getGroupStandings(),
          tournamentService.getTeams(),
          tournamentService.getGroups(),
        ]);
        if (cancelled) return;

        const teamsMap: Record<string, Team> = {};
        teamsData.forEach((t) => {
          teamsMap[t.fifaCode.toLowerCase()] = t;
        });

        const groupNameMap = new Map<string, string>();
        groupsData.forEach((g) => {
          groupNameMap.set(g.slug, g.name);
        });

        const mapped = gs
          .map((g) => {
            const name = groupNameMap.get(g.groupId) || g.groupId;
            const standings = g.standings
              .map((s, idx) => ({
                teamId: s.teamId,
                fifaCode: teamsMap[s.teamId.toLowerCase()]?.fifaCode || s.teamId.toUpperCase(),
                teamName: teamsMap[s.teamId.toLowerCase()]?.name || s.teamId,
                position: s.position ?? idx + 1,
                played: s.played,
                won: s.won,
                drawn: s.drawn,
                lost: s.lost,
                goalsFor: s.goalsFor,
                goalsAgainst: s.goalsAgainst,
                points: s.points,
              }))
              .sort((a, b) => a.position - b.position);
            return { name, standings };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setGroups(mapped);
      } catch {
        // Keep build-time data as fallback
      }
    }
    fetchLive();
    return () => {
      cancelled = true;
    };
  }, []);

  return <GroupStandings {...rest} groups={groups} />;
};
