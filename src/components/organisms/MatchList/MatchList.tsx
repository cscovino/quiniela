import React from 'react';
import { MatchCard, type MatchCardProps } from '@molecules/MatchCard/MatchCard';
import { Typography } from '@atoms/Typography/Typography';
import './MatchList.css';

export interface MatchListProps {
  matches: MatchCardProps[];
  title?: string;
  emptyMessage?: string;
  onMatchClick?: (match: MatchCardProps) => void;
  translations: MatchCardProps['translations'];
  locale?: 'en' | 'es';
  className?: string;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  title,
  emptyMessage = 'No matches available',
  onMatchClick,
  translations,
  locale = 'en',
  className = '',
}) => {
  if (matches.length === 0) {
    return (
      <div className={`match-list match-list--empty ${className}`}>
        {title && <Typography variant="h3">{title}</Typography>}
        <Typography variant="body">{emptyMessage}</Typography>
      </div>
    );
  }

  return (
    <div className={`match-list ${className}`}>
      {title && <Typography variant="h3">{title}</Typography>}
      <div className="match-list__items">
        {matches.map((match, index) => (
          <MatchCard
            key={match.homeTeam.fifaCode + match.awayTeam.fifaCode + index}
            {...match}
            translations={translations}
            locale={locale}
            onClick={onMatchClick ? () => onMatchClick(match) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
