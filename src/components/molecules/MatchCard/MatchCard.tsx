import type { FC } from 'react';

import { Badge } from '@atoms/Badge';
import { Icon, type IconName } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';
import { getDateLocale } from '@utils/i18n';
import { formatKnockoutSlot } from '@utils/knockout-slot';

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
  /**
   * Raw knockout slot code (e.g. "1A", "W-R32-1") shown in place of the home
   * team when it isn't decided yet. Rendered via formatKnockoutSlot(). When set,
   * it takes precedence over homeTeam (which would just be the "TBD" fallback).
   */
  homePlaceholder?: string;
  awayPlaceholder?: string;
  date: Date;
  status: MatchStatus;
  result?: MatchResult;
  stadium?: string;
  phase?: string;
  translations: {
    scheduled: string;
    live: string;
    finished: string;
    postponed: string;
    cancelled: string;
    vs: string;
  };
  locale?: 'en' | 'es';
  className?: string;
  onClick?: () => void;
  compact?: boolean;
}

const getStatusConfig = (
  status: MatchStatus,
  translations: MatchCardProps['translations'],
): {
  variant: 'info' | 'warning' | 'success' | 'error' | 'accent';
  label: string;
  icon?: IconName;
} => {
  const config: Record<
    MatchStatus,
    { variant: 'info' | 'warning' | 'success' | 'error' | 'accent'; label: string; icon?: IconName }
  > = {
    scheduled: { variant: 'info', label: translations.scheduled },
    live: { variant: 'warning', label: translations.live, icon: 'live' },
    finished: { variant: 'success', label: translations.finished },
    postponed: { variant: 'accent', label: translations.postponed },
    cancelled: { variant: 'error', label: translations.cancelled },
  };
  return config[status];
};

export const MatchCard: FC<MatchCardProps> = ({
  homeTeam,
  awayTeam,
  homePlaceholder,
  awayPlaceholder,
  date,
  status,
  result,
  stadium,
  phase,
  translations,
  locale = 'en',
  className = '',
  onClick,
  compact = false,
}) => {
  const config = getStatusConfig(status, translations);
  const localeCode = getDateLocale(locale);
  const formattedDate = date.toLocaleDateString(localeCode, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const flagSize = compact ? 'sm' : 'md';

  const renderTeam = (team: Team, placeholder?: string) => {
    if (placeholder) {
      const label = formatKnockoutSlot(placeholder, locale);
      return (
        <div className="match-card__placeholder" aria-label={label}>
          <Typography variant="small" className="match-card__placeholder-label">
            {label}
          </Typography>
        </div>
      );
    }
    return (
      <TeamFlag
        fifaCode={team.fifaCode}
        name={team.name}
        size={flagSize}
        showName
        noTruncate={compact}
      />
    );
  };

  return (
    <div
      className={`match-card ${compact ? 'match-card--compact' : ''} ${className}`}
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
          {renderTeam(homeTeam, homePlaceholder)}
          {result && (
            <Typography variant={compact ? 'h3' : 'h2'} className="match-card__score">
              {result.home}
            </Typography>
          )}
        </div>

        <div className="match-card__vs">
          <Typography variant="caption">{translations.vs}</Typography>
        </div>

        <div className="match-card__team match-card__team--away">
          {result && (
            <Typography variant={compact ? 'h3' : 'h2'} className="match-card__score">
              {result.away}
            </Typography>
          )}
          {renderTeam(awayTeam, awayPlaceholder)}
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
        {status !== 'scheduled' && (
          <Badge variant={config.variant} size="sm">
            {config.icon && <Icon name={config.icon} size={12} />}
            {config.label}
          </Badge>
        )}
      </div>
    </div>
  );
};
