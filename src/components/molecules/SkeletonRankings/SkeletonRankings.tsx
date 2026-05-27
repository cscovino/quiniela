import type { FC } from 'react';

import './SkeletonRankings.css';

export interface SkeletonRankingsProps {
  rowCount?: number;
  className?: string;
}

export const SkeletonRankings: FC<SkeletonRankingsProps> = ({ rowCount = 5, className = '' }) => {
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className={`skeleton-rankings ${className}`}>
      <div className="skeleton skeleton-rankings__title" />
      <div className="skeleton-rankings__list">
        {rows.map((r) => (
          <div key={r} className="skeleton-rankings__row">
            <div className="skeleton skeleton-rankings__position" />
            <div className="skeleton skeleton-rankings__avatar" />
            <div className="skeleton skeleton-rankings__name" />
            <div className="skeleton skeleton-rankings__points" />
          </div>
        ))}
      </div>
    </div>
  );
};
