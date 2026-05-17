import React from 'react';
import {
  TournamentHeader,
  type TournamentHeaderProps,
} from '@organisms/TournamentHeader/TournamentHeader';
import { MatchList, type MatchListProps } from '@organisms/MatchList/MatchList';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import './HomeTemplate.css';

export interface HomeTemplateProps {
  tournamentProps: TournamentHeaderProps;
  matches: MatchListProps['matches'];
  rankings: RankingsTableProps['rankings'];
  translations: {
    heroTitle: string;
    heroSubtitle: string;
    ctaPredictions: string;
    ctaStandings: string;
    matchesTitle: string;
    rankingsTitle: string;
    matchList: MatchListProps['translations'];
  };
  locale?: 'en' | 'es';
  onPredictionsClick?: () => void;
  onStandingsClick?: () => void;
  className?: string;
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  tournamentProps,
  matches,
  rankings,
  translations,
  locale = 'en',
  onPredictionsClick,
  onStandingsClick,
  className = '',
}) => {
  return (
    <div className={`home-template ${className}`}>
      <main className="home-template__content">
        <TournamentHeader {...tournamentProps} />

        <section className="home-template__hero">
          <Typography variant="h2">{translations.heroTitle}</Typography>
          <Typography variant="body">{translations.heroSubtitle}</Typography>
          <div className="home-template__actions">
            <Button variant="primary" size="lg" onClick={onPredictionsClick}>
              {translations.ctaPredictions}
            </Button>
            <Button variant="secondary" size="lg" onClick={onStandingsClick}>
              {translations.ctaStandings}
            </Button>
          </div>
        </section>

        <section className="home-template__matches">
          <MatchList
            matches={matches}
            title={translations.matchesTitle}
            translations={translations.matchList}
            locale={locale}
          />
        </section>

        <section className="home-template__rankings">
          <RankingsTable rankings={rankings} title={translations.rankingsTitle} />
        </section>
      </main>
    </div>
  );
};
