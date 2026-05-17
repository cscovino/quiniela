import React from 'react';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import { BracketView, type BracketViewProps } from '@organisms/BracketView/BracketView';
import { Typography } from '@atoms/Typography/Typography';
import './StandingsTemplate.css';

export interface StandingsTemplateProps {
  groups: GroupStandingsProps['groups'];
  bracketRounds?: BracketViewProps['rounds'];
  translations: {
    title: string;
    groupStageTitle: string;
    knockoutTitle: string;
    standings: GroupStandingsProps['translations'];
    bracket: BracketViewProps['translations'];
  };
  locale?: 'en' | 'es';
  className?: string;
}

export const StandingsTemplate: React.FC<StandingsTemplateProps> = ({
  groups,
  bracketRounds,
  translations,
  locale = 'en',
  className = '',
}) => {
  return (
    <div className={`standings-template ${className}`}>
      <main className="standings-template__content">
        <header className="standings-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <section className="standings-template__groups">
          <Typography variant="h2">{translations.groupStageTitle}</Typography>
          <GroupStandings groups={groups} translations={translations.standings} />
        </section>

        {bracketRounds && bracketRounds.length > 0 && (
          <section className="standings-template__bracket">
            <Typography variant="h2">{translations.knockoutTitle}</Typography>
            <BracketView
              rounds={bracketRounds}
              translations={translations.bracket}
              locale={locale}
            />
          </section>
        )}
      </main>
    </div>
  );
};
