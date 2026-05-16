import React from 'react';
import { GroupHeader, type GroupStanding } from '@molecules/GroupHeader/GroupHeader';
import { Typography } from '@atoms/Typography/Typography';
import './GroupStandings.css';

export interface GroupStandingsProps {
  groups: {
    name: string;
    standings: GroupStanding[];
  }[];
  className?: string;
}

export const GroupStandings: React.FC<GroupStandingsProps> = ({ groups, className = '' }) => {
  if (groups.length === 0) {
    return (
      <div className={`group-standings group-standings--empty ${className}`}>
        <Typography variant="body">No groups available</Typography>
      </div>
    );
  }

  return (
    <div className={`group-standings ${className}`}>
      {groups.map((group) => (
        <div key={group.name} className="group-standings__group">
          <GroupHeader name={group.name} standings={group.standings} />
          <div className="group-standings__table">
            <div className="group-standings__header">
              <span className="group-standings__col group-standings__col--team">Team</span>
              <span className="group-standings__col">P</span>
              <span className="group-standings__col">W</span>
              <span className="group-standings__col">D</span>
              <span className="group-standings__col">L</span>
              <span className="group-standings__col">GF</span>
              <span className="group-standings__col">GA</span>
              <span className="group-standings__col group-standings__col--pts">Pts</span>
            </div>
            {group.standings.map((team) => (
              <div key={team.teamId} className="group-standings__row">
                <span className="group-standings__col group-standings__col--team">
                  {team.teamName}
                </span>
                <span className="group-standings__col">{team.played}</span>
                <span className="group-standings__col">{team.won}</span>
                <span className="group-standings__col">{team.drawn}</span>
                <span className="group-standings__col">{team.lost}</span>
                <span className="group-standings__col">{team.goalsFor}</span>
                <span className="group-standings__col">{team.goalsAgainst}</span>
                <span className="group-standings__col group-standings__col--pts">
                  {team.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
