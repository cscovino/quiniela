import React from 'react';
import { Typography } from '@atoms/Typography/Typography';
import { Badge } from '@atoms/Badge/Badge';
import { Icon } from '@atoms/Icon/Icon';
import './TournamentHeader.css';

export type TournamentStatus = 'draft' | 'active' | 'finished';

export interface TournamentHeaderProps {
  name: string;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  participantCount?: number;
  className?: string;
}

const statusConfig: Record<
  TournamentStatus,
  { variant: 'info' | 'success' | 'accent'; label: string }
> = {
  draft: { variant: 'info', label: 'Draft' },
  active: { variant: 'success', label: 'Active' },
  finished: { variant: 'accent', label: 'Finished' },
};

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  name,
  status,
  startDate,
  endDate,
  participantCount,
  className = '',
}) => {
  const config = statusConfig[status];
  const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

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

        <Badge variant={config.variant} size="md">
          {config.label}
        </Badge>

        {participantCount !== undefined && (
          <div className="tournament-header__participants">
            <Icon name="user" size={16} />
            <Typography variant="small">{participantCount} players</Typography>
          </div>
        )}
      </div>
    </div>
  );
};
