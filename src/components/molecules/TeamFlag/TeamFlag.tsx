import type { FC } from 'react';

import { getFlagClass } from '@utils/flagMapping';

import './TeamFlag.css';

export interface TeamFlagProps {
  fifaCode: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  name?: string;
  className?: string;
  noTruncate?: boolean;
}

export const TeamFlag: FC<TeamFlagProps> = ({
  fifaCode,
  size = 'md',
  showName = false,
  name,
  className = '',
  noTruncate = false,
}) => {
  const flagClass = getFlagClass(fifaCode);

  return (
    <div
      className={`team-flag team-flag--${size} ${noTruncate ? 'team-flag--no-truncate' : ''} ${className}`}
    >
      <span
        className={`flag-icon ${flagClass}`}
        role="img"
        aria-label={`${name || fifaCode} flag`}
      />
      {showName && name && (
        <>
          <span className="team-flag__name">{name}</span>
          <span className="team-flag__fifa-code">{fifaCode}</span>
        </>
      )}
    </div>
  );
};
