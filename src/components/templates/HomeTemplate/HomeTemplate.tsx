import React, { useEffect, useState } from 'react';
import {
  TournamentHeader,
  type TournamentHeaderProps,
} from '@organisms/TournamentHeader/TournamentHeader';
import { MatchList, type MatchListProps } from '@organisms/MatchList/MatchList';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { tournamentService } from '@services/tournament-service';
import type { Match, PredictorStats } from '@types/firestore';
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

interface HomeData {
  matches: MatchListProps['matches'];
  rankings: RankingsTableProps['rankings'];
  isLoading: boolean;
  error: string | null;
}

const mapMatchToCard = (
  match: Match & { id: string },
  teams: Record<string, { fifaCode: string; name: string }>,
): MatchListProps['matches'][0] => {
  const homeTeam = match.homeTeamId
    ? teams[match.homeTeamId] || {
        fifaCode: match.homeTeamId.toUpperCase(),
        name: match.homeTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };
  const awayTeam = match.awayTeamId
    ? teams[match.awayTeamId] || {
        fifaCode: match.awayTeamId.toUpperCase(),
        name: match.awayTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };

  return {
    homeTeam,
    awayTeam,
    date: match.date.toDate(),
    status: match.status,
    stadium: match.stadium,
    result:
      match.result.home !== null
        ? { home: match.result.home, away: match.result.away! }
        : undefined,
  };
};

const mapStatsToRanking = (
  stats: PredictorStats & { userId: string; predictorId: string },
): RankingsTableProps['rankings'][0] => ({
  userId: stats.userId,
  predictorId: stats.predictorId,
  displayName: stats.predictorId.split('-').slice(1).join('-') || stats.userId.slice(0, 8),
  points: stats.totalPoints,
  accuracy: Math.round(stats.accuracy * 100),
  streak: stats.currentStreak,
});

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  tournamentProps,
  translations,
  locale = 'en',
  onPredictionsClick,
  onStandingsClick,
  className = '',
}) => {
  const [data, setData] = useState<HomeData>({
    matches: [],
    rankings: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matches, teams, stats] = await Promise.all([
          tournamentService.getMatches({ status: 'scheduled' }),
          tournamentService.getTeams(),
          tournamentService.getAllPredictorStats(),
        ]);

        const teamsMap = teams.reduce<Record<string, { fifaCode: string; name: string }>>(
          (acc, t) => {
            acc[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
            return acc;
          },
          {},
        );

        setData({
          matches: matches.slice(0, 5).map((m) => mapMatchToCard(m, teamsMap)),
          rankings: stats.slice(0, 10).map(mapStatsToRanking),
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setData({
          matches: [],
          rankings: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load data',
        });
      }
    };

    fetchData();
  }, []);

  if (data.isLoading) {
    return (
      <div className={`home-template ${className}`}>
        <main className="home-template__content">
          <Typography variant="body">{locale === 'en' ? 'Loading...' : 'Cargando...'}</Typography>
        </main>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className={`home-template ${className}`}>
        <main className="home-template__content">
          <Typography variant="body" style={{ color: 'var(--color-error)' }}>
            Error: {data.error}
          </Typography>
        </main>
      </div>
    );
  }

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
            matches={data.matches}
            title={translations.matchesTitle}
            translations={translations.matchList}
            locale={locale}
            emptyMessage={locale === 'en' ? 'No upcoming matches' : 'No hay partidos próximos'}
          />
        </section>

        <section className="home-template__rankings">
          <RankingsTable
            rankings={data.rankings}
            title={translations.rankingsTitle}
            emptyMessage={locale === 'en' ? 'No rankings yet' : 'Aún no hay clasificación'}
          />
        </section>
      </main>
    </div>
  );
};
