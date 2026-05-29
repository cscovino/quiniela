import type { FC } from 'react';

import { getBadgeDefinition } from '@app-types/badges';
import { Avatar } from '@atoms/Avatar';
import { Badge } from '@atoms/Badge';
import { Icon } from '@atoms/Icon';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { Typography } from '@atoms/Typography';

import './RankingRow.css';

export interface RankingRowProps {
  position: number;
  avatarUrl?: string;
  avatar?: { bgColor: string; emoji: string };
  displayName: string;
  points: number;
  accuracy: number;
  streak: number;
  badges?: Record<string, string>;
  rankChange?: 'up' | 'down' | 'same';
  predictionsCount?: number;
  isCurrentUser?: boolean;
  className?: string;
}

const RANK_ARROW: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  same: '\u2192',
};

export const RankingRow: FC<RankingRowProps> = ({
  position,
  avatarUrl,
  avatar,
  displayName,
  points,
  accuracy,
  streak,
  badges,
  rankChange,
  predictionsCount,
  isCurrentUser = false,
  className = '',
}) => {
  const getPositionBadge = () => {
    if (position === 1) return { variant: 'accent' as const, icon: 'trophy' };
    if (position === 2) return { variant: 'info' as const, icon: 'trophy' };
    if (position === 3) return { variant: 'success' as const, icon: 'trophy' };
    return null;
  };

  const positionBadge = getPositionBadge();

  const predictorLike = avatar ? { id: displayName, name: displayName, avatar } : undefined;

  const earnedBadges = badges
    ? Object.keys(badges)
        .map((id) => getBadgeDefinition(id))
        .filter(Boolean)
    : [];

  return (
    <div className={`ranking-row ${isCurrentUser ? 'ranking-row--current' : ''} ${className}`}>
      <div className="ranking-row__position">
        {rankChange && (
          <span
            className={`ranking-row__rank-change ranking-row__rank-change--${rankChange}`}
            aria-label={rankChange}
          >
            {RANK_ARROW[rankChange]}
          </span>
        )}
        {positionBadge ? (
          <Badge variant={positionBadge.variant} size="sm">
            <Icon name={positionBadge.icon} size={12} />#{position}
          </Badge>
        ) : (
          <Typography variant="small">#{position}</Typography>
        )}
      </div>

      <div className="ranking-row__user">
        {predictorLike ? (
          <PredictorAvatar predictor={predictorLike} size="sm" />
        ) : (
          <Avatar src={avatarUrl} name={displayName} size="sm" />
        )}
        <Typography variant="small" className="ranking-row__name">
          {displayName}
        </Typography>
        {earnedBadges.length > 0 && (
          <div className="ranking-row__badges">
            {earnedBadges.map((def) => (
              <span key={def!.id} className="ranking-row__badge" title={def!.name.en}>
                <Icon name={def!.icon} size={12} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ranking-row__stats">
        <div className="ranking-row__stat">
          <Icon name="star" size={14} />
          <Typography variant="small">{points}</Typography>
        </div>
        <div className="ranking-row__stat">
          <Icon name="target" size={14} />
          <Typography variant="small">{accuracy}%</Typography>
        </div>
        {streak > 0 && (
          <div className="ranking-row__stat">
            <Icon name="fire" size={14} />
            <Typography variant="small">{streak}</Typography>
          </div>
        )}
        {predictionsCount != null && (
          <div className="ranking-row__stat">
            <Icon name="clock" size={14} />
            <Typography variant="small">{predictionsCount}</Typography>
          </div>
        )}
      </div>
    </div>
  );
};
