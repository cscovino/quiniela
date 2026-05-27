import type { FC } from 'react';

import { Badge } from '@atoms/Badge';
import { Icon } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';

import './ScoreDisplay.css';

export interface ScoreDisplayProps {
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  isExact?: boolean;
  isWinner?: boolean;
  className?: string;
}

export const ScoreDisplay: FC<ScoreDisplayProps> = ({
  homeScore,
  awayScore,
  pointsEarned = 0,
  isExact = false,
  isWinner = false,
  className = '',
}) => {
  const getPointsBadge = () => {
    if (pointsEarned === 0) return null;
    if (isExact)
      return { variant: 'accent' as const, label: `+${pointsEarned} EXACT!`, icon: 'star' };
    if (isWinner) return { variant: 'success' as const, label: `+${pointsEarned}`, icon: 'check' };
    return { variant: 'info' as const, label: `+${pointsEarned}`, icon: 'check' };
  };

  const badge = getPointsBadge();

  return (
    <div className={`score-display ${className}`}>
      <div className="score-display__scores">
        <Typography variant="h1" className="score-display__score score-display__score--home">
          {homeScore}
        </Typography>
        <Typography variant="caption" className="score-display__separator">
          -
        </Typography>
        <Typography variant="h1" className="score-display__score score-display__score--away">
          {awayScore}
        </Typography>
      </div>

      {badge && (
        <div className="score-display__points">
          <Icon name={badge.icon} size={16} />
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </div>
      )}
    </div>
  );
};
