import type { FC } from 'react';

import { Badge } from '@atoms/Badge';
import { Icon } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';

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
  translations: {
    qualified: string;
  };
  className?: string;
}

export const GroupHeader: FC<GroupHeaderProps> = ({
  name,
  standings,
  translations,
  className = '',
}) => {
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
          <Typography variant="caption">{translations.qualified}</Typography>
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
