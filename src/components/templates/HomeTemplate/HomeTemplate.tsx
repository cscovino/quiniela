import React, { useEffect, useState } from 'react';
import {
  TournamentHeader,
  type TournamentHeaderProps,
} from '@organisms/TournamentHeader/TournamentHeader';
import { MatchList, type MatchListProps } from '@organisms/MatchList/MatchList';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
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
    loginToPredict: string;
    loginToRankings: string;
  };
  locale?: 'en' | 'es';
  onPredictionsClick?: () => void;
  onStandingsClick?: () => void;
  className?: string;
}

interface SectionState {
  matches: MatchListProps['matches'];
  rankings: RankingsTableProps['rankings'];
  matchesLoading: boolean;
  rankingsLoading: boolean;
  matchesError: string | null;
  rankingsError: string | null;
}

const LOAD_TIMEOUT = 8000;

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
  const user = useAuthStore((state) => state.user);
  const [state, setState] = useState<SectionState>({
    matches: [],
    rankings: [],
    matchesLoading: true,
    rankingsLoading: true,
    matchesError: null,
    rankingsError: null,
  });

  const loginUrl = locale === 'en' ? '/en/login' : '/login';

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const handlePredictionsClick = () => {
    if (!user) {
      handleLogin();
    } else {
      onPredictionsClick?.();
    }
  };

  const handleStandingsClick = () => {
    if (!user) {
      handleLogin();
    } else {
      onStandingsClick?.();
    }
  };

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          matchesLoading: false,
          rankingsLoading: false,
          matchesError: prev.matches.length === 0 ? 'Request timed out' : null,
          rankingsError: prev.rankings.length === 0 ? 'Request timed out' : null,
        }));
      }
    }, LOAD_TIMEOUT);

    const fetchData = async () => {
      try {
        const [matches, teams, stats] = await Promise.allSettled([
          tournamentService.getMatches({ status: 'scheduled' }),
          tournamentService.getTeams(),
          user ? tournamentService.getAllPredictorStats() : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const teamsMap: Record<string, { fifaCode: string; name: string }> = {};
        if (teams.status === 'fulfilled') {
          teams.value.forEach((t) => {
            teamsMap[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
          });
        }

        const newMatches: MatchListProps['matches'] =
          matches.status === 'fulfilled'
            ? matches.value.slice(0, 5).map((m) => mapMatchToCard(m, teamsMap))
            : [];

        const newRankings: RankingsTableProps['rankings'] =
          stats.status === 'fulfilled' ? stats.value.slice(0, 10).map(mapStatsToRanking) : [];

        setState({
          matches: newMatches,
          rankings: newRankings,
          matchesLoading: false,
          rankingsLoading: false,
          matchesError: matches.status === 'rejected' ? 'Failed to load matches' : null,
          rankingsError: stats.status === 'rejected' ? 'Failed to load rankings' : null,
        });
      } catch {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            matchesLoading: false,
            rankingsLoading: false,
            matchesError: 'Failed to load data',
            rankingsError: 'Failed to load data',
          }));
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [user]);

  return (
    <div className={`home-template ${className}`}>
      <main className="home-template__content">
        <TournamentHeader {...tournamentProps} />

        <section className="home-template__hero">
          <Typography variant="h2">{translations.heroTitle}</Typography>
          <Typography variant="body">{translations.heroSubtitle}</Typography>
          <div className="home-template__actions">
            <Button variant="primary" size="lg" onClick={handlePredictionsClick}>
              {translations.ctaPredictions}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleStandingsClick}>
              {translations.ctaStandings}
            </Button>
          </div>
        </section>

        <section className="home-template__matches">
          {state.matchesLoading ? (
            <div className="home-template__loading">
              <Spinner size="lg" />
              <Typography variant="body">
                {locale === 'en' ? 'Loading matches...' : 'Cargando partidos...'}
              </Typography>
            </div>
          ) : (
            <MatchList
              matches={state.matches}
              title={translations.matchesTitle}
              translations={translations.matchList}
              locale={locale}
              emptyMessage={
                state.matchesError ||
                (locale === 'en' ? 'No upcoming matches' : 'No hay partidos próximos')
              }
            />
          )}
        </section>

        <section className="home-template__rankings">
          {!user ? (
            <div className="home-template__auth-required">
              <Typography variant="body">{translations.loginToRankings}</Typography>
              <Button variant="primary" size="sm" onClick={handleLogin}>
                {locale === 'en' ? 'Login' : 'Iniciar Sesión'}
              </Button>
            </div>
          ) : state.rankingsLoading ? (
            <div className="home-template__loading">
              <Spinner size="lg" />
              <Typography variant="body">
                {locale === 'en' ? 'Loading rankings...' : 'Cargando clasificación...'}
              </Typography>
            </div>
          ) : (
            <RankingsTable
              rankings={state.rankings}
              title={translations.rankingsTitle}
              emptyMessage={
                state.rankingsError ||
                (locale === 'en' ? 'No rankings yet' : 'Aún no hay clasificación')
              }
            />
          )}
        </section>
      </main>
    </div>
  );
};
