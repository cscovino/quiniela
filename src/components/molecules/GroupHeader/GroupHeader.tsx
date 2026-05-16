import React from 'react';
import { Typography } from '@atoms/Typography/Typography';
import { Badge } from '@atoms/Badge/Badge';
import { Icon } from '@atoms/Icon/Icon';
import './GroupHeader.css';

export interface GroupStanding {
  teamId: string;
  teamName: string;
  fifaCode: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface GroupHeaderProps {
  name: string;
  standings?: GroupStanding[];
  className?: string;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ name, standings, className = '' }) => {
  const getQualifiedTeams = () => {
    if (!standings) return [];
    return standings.filter((s) => s.position <= 2).map((s) => s.teamName);
  };

  const qualified = getQualifiedTeams();

  return (
    <div className={`group-header ${className}`}>
      <div className="group-header__title">
        <Icon name="flag" size={20} />
        <Typography variant="h3">{name}</Typography>
      </div>

      {qualified.length > 0 && (
        <div className="group-header__qualified">
          <Typography variant="caption">Qualified:</Typography>
          <div className="group-header__teams">
            {qualified.map((team) => (
              <Badge key={team} variant="success" size="sm">
                {team}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
