import type { FC } from 'react';

import { Icon } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';

import './TournamentHeader.css';

export type TournamentStatus = 'draft' | 'active' | 'finished';

export interface TournamentHeaderProps {
  name: string;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  participantCount?: number;
  locale?: string;
  className?: string;
  translations: {
    teams: string;
  };
}

export const TournamentHeader: FC<TournamentHeaderProps> = ({
  name,
  startDate,
  endDate,
  participantCount,
  locale = 'en',
  className = '',
  translations,
}) => {
  const formattedDates = `${startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className={`tournament-header ${className}`}>
      <div className="tournament-header__title">
        <Icon name="trophy" size={32} />
        <Typography variant="h1">{name}</Typography>
      </div>

      <div className="tournament-header__meta">
        <div className="tournament-header__dates">
          <Icon name="clock" size={16} />
          <Typography variant="small">{formattedDates}</Typography>
        </div>

        {participantCount !== undefined && (
          <div className="tournament-header__participants">
            <Icon name="user" size={16} />
            <Typography variant="small">
              {participantCount} {translations.teams}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
