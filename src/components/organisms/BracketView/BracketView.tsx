import React from 'react';
import { MatchCard, type MatchCardProps } from '@molecules/MatchCard/MatchCard';
import { Typography } from '@atoms/Typography/Typography';
import './BracketView.css';

export interface BracketRound {
  name: string;
  matches: MatchCardProps[];
}

export interface BracketViewProps {
  rounds: BracketRound[];
  className?: string;
}

export const BracketView: React.FC<BracketViewProps> = ({ rounds, className = '' }) => {
  if (rounds.length === 0) {
    return (
      <div className={`bracket-view bracket-view--empty ${className}`}>
        <Typography variant="body">Bracket not available yet</Typography>
      </div>
    );
  }

  return (
    <div className={`bracket-view ${className}`}>
      <div className="bracket-view__rounds">
        {rounds.map((round) => (
          <div key={round.name} className="bracket-view__round">
            <Typography variant="h4" className="bracket-view__round-title">
              {round.name}
            </Typography>
            <div className="bracket-view__matches">
              {round.matches.map((match, index) => (
                <MatchCard
                  key={match.homeTeam.fifaCode + match.awayTeam.fifaCode + index}
                  {...match}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
