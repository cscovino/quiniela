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
  onPredictionsClick?: () => void;
  onStandingsClick?: () => void;
  className?: string;
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  tournamentProps,
  matches,
  rankings,
  onPredictionsClick,
  onStandingsClick,
  className = '',
}) => {
  return (
    <div className={`home-template ${className}`}>
      <main className="home-template__content">
        <TournamentHeader {...tournamentProps} />

        <section className="home-template__hero">
          <Typography variant="h2">Predict. Compet. Win.</Typography>
          <Typography variant="body">
            Make your predictions for every match and climb the leaderboard!
          </Typography>
          <div className="home-template__actions">
            <Button variant="primary" size="lg" onClick={onPredictionsClick}>
              Make Predictions
            </Button>
            <Button variant="secondary" size="lg" onClick={onStandingsClick}>
              View Standings
            </Button>
          </div>
        </section>

        <section className="home-template__matches">
          <MatchList matches={matches} title="Upcoming Matches" />
        </section>

        <section className="home-template__rankings">
          <RankingsTable rankings={rankings} title="Top Players" />
        </section>
      </main>
    </div>
  );
};
