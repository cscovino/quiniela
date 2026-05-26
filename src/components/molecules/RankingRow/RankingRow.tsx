import React from 'react';
import { Avatar } from '@atoms/Avatar/Avatar';
import { PredictorAvatar } from '@atoms/PredictorAvatar/PredictorAvatar';
import { Typography } from '@atoms/Typography/Typography';
import { Badge } from '@atoms/Badge/Badge';
import { Icon } from '@atoms/Icon/Icon';
import './RankingRow.css';

export interface RankingRowProps {
  position: number;
  avatarUrl?: string;
  avatar?: { bgColor: string; emoji: string };
  displayName: string;
  points: number;
  accuracy: number;
  streak: number;
  isCurrentUser?: boolean;
  className?: string;
}

export const RankingRow: React.FC<RankingRowProps> = ({
  position,
  avatarUrl,
  avatar,
  displayName,
  points,
  accuracy,
  streak,
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

  return (
    <div className={`ranking-row ${isCurrentUser ? 'ranking-row--current' : ''} ${className}`}>
      <div className="ranking-row__position">
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
      </div>

      <div className="ranking-row__stats">
        <div className="ranking-row__stat">
          <Icon name="star" size={14} />
          <Typography variant="small">{points}</Typography>
        </div>
        <div className="ranking-row__stat">
          <Icon name="target" size={14} />
          <Typography variant="small">{Math.round(accuracy * 100)}%</Typography>
        </div>
        {streak > 0 && (
          <div className="ranking-row__stat">
            <Icon name="fire" size={14} />
            <Typography variant="small">{streak}</Typography>
          </div>
        )}
      </div>
    </div>
  );
};
