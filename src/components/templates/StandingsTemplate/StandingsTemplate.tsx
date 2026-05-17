import React from 'react';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import { BracketView, type BracketViewProps } from '@organisms/BracketView/BracketView';
import { Typography } from '@atoms/Typography/Typography';
import './StandingsTemplate.css';

export interface StandingsTemplateProps {
  groups: GroupStandingsProps['groups'];
  bracketRounds?: BracketViewProps['rounds'];
  className?: string;
}

export const StandingsTemplate: React.FC<StandingsTemplateProps> = ({
  groups,
  bracketRounds,
  className = '',
}) => {
  return (
    <div className={`standings-template ${className}`}>
      <main className="standings-template__content">
        <header className="standings-template__header">
          <Typography variant="h1">Tournament Standings</Typography>
        </header>

        <section className="standings-template__groups">
          <Typography variant="h2">Group Stage</Typography>
          <GroupStandings groups={groups} />
        </section>

        {bracketRounds && bracketRounds.length > 0 && (
          <section className="standings-template__bracket">
            <Typography variant="h2">Knockout Stage</Typography>
            <BracketView rounds={bracketRounds} />
          </section>
        )}
      </main>
    </div>
  );
};
