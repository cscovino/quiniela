import type { FC } from 'react';

import './SkeletonStandings.css';

export interface SkeletonStandingsProps {
  groupCount?: number;
  className?: string;
}

export const SkeletonStandings: FC<SkeletonStandingsProps> = ({
  groupCount = 2,
  className = '',
}) => {
  const groups = Array.from({ length: groupCount }, (_, i) => i);
  const rows = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className={`skeleton-standings ${className}`}>
      {groups.map((g) => (
        <div key={g} className="skeleton-standings__group">
          <div className="skeleton-standings__header-row">
            <div className="skeleton skeleton-standings__group-icon" />
            <div className="skeleton skeleton-standings__group-name" />
          </div>

          <div className="skeleton-standings__table">
            <div className="skeleton-standings__table-header">
              <div className="skeleton skeleton-standings__col skeleton-standings__col--wide" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
              <div className="skeleton skeleton-standings__col" />
            </div>
            {rows.map((r) => (
              <div key={r} className="skeleton-standings__row">
                <div className="skeleton-standings__row-team">
                  <div className="skeleton skeleton-standings__flag" />
                  <div className="skeleton skeleton-standings__team-name" />
                </div>
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
                <div className="skeleton skeleton-standings__cell" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
