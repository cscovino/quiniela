import React from 'react';
import { TeamFlag } from '@molecules/TeamFlag/TeamFlag';
import { Badge } from '@atoms/Badge/Badge';
import { Typography } from '@atoms/Typography/Typography';
import { Icon, type IconName } from '@atoms/Icon/Icon';
import './MatchCard.css';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Team {
  fifaCode: string;
  name: string;
}

export interface MatchResult {
  home: number | null;
  away: number | null;
}

export interface MatchCardProps {
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  status: MatchStatus;
  result?: MatchResult;
  stadium?: string;
  phase?: string;
  className?: string;
  onClick?: () => void;
}

const statusConfig: Record<
  MatchStatus,
  { variant: 'info' | 'warning' | 'success' | 'error' | 'accent'; label: string; icon?: IconName }
> = {
  scheduled: { variant: 'info', label: 'Scheduled' },
  live: { variant: 'warning', label: 'LIVE', icon: 'live' },
  finished: { variant: 'success', label: 'Finished' },
  postponed: { variant: 'accent', label: 'Postponed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
};

export const MatchCard: React.FC<MatchCardProps> = ({
  homeTeam,
  awayTeam,
  date,
  status,
  result,
  stadium,
  phase,
  className = '',
  onClick,
}) => {
  const config = statusConfig[status];
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`match-card ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {phase && (
        <div className="match-card__phase">
          <Typography variant="caption">{phase.toUpperCase()}</Typography>
        </div>
      )}

      <div className="match-card__teams">
        <div className="match-card__team match-card__team--home">
          <TeamFlag fifaCode={homeTeam.fifaCode} name={homeTeam.name} size="md" showName />
          {result && (
            <Typography variant="h2" className="match-card__score">
              {result.home}
            </Typography>
          )}
        </div>

        <div className="match-card__vs">
          <Typography variant="caption">VS</Typography>
        </div>

        <div className="match-card__team match-card__team--away">
          {result && (
            <Typography variant="h2" className="match-card__score">
              {result.away}
            </Typography>
          )}
          <TeamFlag fifaCode={awayTeam.fifaCode} name={awayTeam.name} size="md" showName />
        </div>
      </div>

      <div className="match-card__footer">
        <div className="match-card__meta">
          <Icon name="clock" size={16} />
          <Typography variant="small">
            {formattedDate} • {formattedTime}
          </Typography>
        </div>
        {stadium && (
          <Typography variant="small" className="match-card__stadium">
            {stadium}
          </Typography>
        )}
        <Badge variant={config.variant} size="sm">
          {config.icon && <Icon name={config.icon} size={12} />}
          {config.label}
        </Badge>
      </div>
    </div>
  );
};
