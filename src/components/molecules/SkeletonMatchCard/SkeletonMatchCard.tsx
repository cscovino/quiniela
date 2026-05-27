import type { FC } from 'react';

import './SkeletonMatchCard.css';

export interface SkeletonMatchCardProps {
  compact?: boolean;
  className?: string;
}

export const SkeletonMatchCard: FC<SkeletonMatchCardProps> = ({
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`skeleton-match-card ${compact ? 'skeleton-match-card--compact' : ''} ${className}`}
    >
      <div className="skeleton-match-card__phase">
        <div className="skeleton skeleton-match-card__phase-bar" />
      </div>

      <div className="skeleton-match-card__teams">
        <div className="skeleton-match-card__team skeleton-match-card__team--home">
          <div className="skeleton skeleton-match-card__flag" />
          <div className="skeleton skeleton-match-card__name" />
          <div className="skeleton skeleton-match-card__score" />
        </div>

        <div className="skeleton-match-card__vs">
          <div className="skeleton skeleton-match-card__vs-text" />
        </div>

        <div className="skeleton-match-card__team skeleton-match-card__team--away">
          <div className="skeleton skeleton-match-card__score" />
          <div className="skeleton skeleton-match-card__name" />
          <div className="skeleton skeleton-match-card__flag" />
        </div>
      </div>

      <div className="skeleton-match-card__footer">
        <div className="skeleton-match-card__meta">
          <div className="skeleton skeleton-match-card__date" />
          <div className="skeleton skeleton-match-card__badge" />
        </div>
      </div>
    </div>
  );
};
