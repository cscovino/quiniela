import React, { useEffect, useState } from 'react';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable/RankingsTable';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { AuthGuard } from '@atoms/AuthGuard/AuthGuard';
import { tournamentService } from '@services/tournament-service';
import type { PredictorStats } from '@types/firestore';
import './RankingsTemplate.css';

export interface RankingsTemplateProps {
  translations: {
    title: string;
    noRankings: string;
    loading: string;
  };
  locale?: 'en' | 'es';
  className?: string;
}

const RankingsContent: React.FC<{
  translations: RankingsTemplateProps['translations'];
  className: string;
}> = ({ translations, className }) => {
  const [rankings, setRankings] = useState<RankingsTableProps['rankings']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRankings = async () => {
      try {
        const stats = await tournamentService.getAllPredictorStats();

        if (cancelled) return;

        const mapped = stats.map(
          (stat: PredictorStats & { userId: string; predictorId: string }) => ({
            userId: stat.userId,
            predictorId: stat.predictorId,
            displayName: stat.predictorId.split('-').slice(1).join('-') || stat.predictorId,
            points: stat.totalPoints,
            accuracy: stat.accuracy,
            streak: stat.currentStreak,
          }),
        );

        setRankings(mapped);
      } catch {
        if (!cancelled) {
          setError('Failed to load rankings');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRankings();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={`rankings-template ${className}`}>
        <div className="rankings-template__loading">
          <Spinner size="lg" />
          <Typography variant="body">{translations.loading}</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rankings-template ${className}`}>
        <div className="rankings-template__error">
          <Typography variant="body">{error}</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={`rankings-template ${className}`}>
      <main className="rankings-template__content">
        <header className="rankings-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <section className="rankings-template__table">
          {rankings.length === 0 ? (
            <Typography variant="body">{translations.noRankings}</Typography>
          ) : (
            <RankingsTable
              rankings={rankings}
              title={translations.title}
              emptyMessage={translations.noRankings}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export const RankingsTemplate: React.FC<RankingsTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const loginUrl = locale === 'en' ? '/en/login' : '/login';
  const message =
    locale === 'en' ? 'Login to see rankings' : 'Inicia sesión para ver la clasificación';
  const loadingMessage = locale === 'en' ? 'Loading...' : 'Cargando...';

  return (
    <AuthGuard loginUrl={loginUrl} message={message} loadingMessage={loadingMessage}>
      <RankingsContent translations={translations} className={className} />
    </AuthGuard>
  );
};
