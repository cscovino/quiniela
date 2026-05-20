import React, { useEffect, useState, useCallback } from 'react';
import { PredictionForm, type MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { Button } from '@atoms/Button/Button';
import { tournamentService } from '@services/tournament-service';
import { predictionService } from '@services/prediction-service';
import { useAuthStore } from '@store/auth-store';
import type { Match } from '@types/firestore';
import './PredictionsTemplate.css';

export interface PredictionsTemplateProps {
  translations: {
    title: string;
    noMatches: string;
    submitSuccess: string;
    submitError: string;
    loginRequired: string;
    loginButton: string;
    loading: string;
  };
  locale?: 'en' | 'es';
  className?: string;
}

const mapMatchToPrediction = (
  match: Match & { id: string },
  teams: Record<string, { fifaCode: string; name: string }>,
): MatchPrediction => {
  const homeTeam = match.homeTeamId
    ? teams[match.homeTeamId] || {
        fifaCode: match.homeTeamId.toUpperCase(),
        name: match.homeTeamId,
      }
    : { fifaCode: 'TBD', name: 'TBD' };
  const awayTeam = match.awayTeamId
    ? teams[match.awayTeamId] || {
        fifaCode: match.awayTeamId.toUpperCase(),
        name: match.awayTeamId,
      }
    : { fifaCode: 'TBD', name: 'TBD' };

  return {
    matchId: match.id,
    homeTeam,
    awayTeam,
    phase: match.phase === 'group' ? 'group' : 'knockout',
    predictionDeadline: match.predictionDeadline.toDate(),
  };
};

export const PredictionsTemplate: React.FC<PredictionsTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const { user, initAuth, isAuthLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [firestoreMatches, setFirestoreMatches] = useState<(Match & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [existingBets, setExistingBets] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [matchesResult, teamsResult] = await Promise.allSettled([
          tournamentService.getMatches({ status: 'scheduled' }),
          tournamentService.getTeams(),
        ]);

        if (cancelled) return;

        const teamsMap: Record<string, { fifaCode: string; name: string }> = {};
        if (teamsResult.status === 'fulfilled') {
          teamsResult.value.forEach((t) => {
            teamsMap[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
            teamsMap[t.fifaCode] = { fifaCode: t.fifaCode, name: t.name };
          });
        }

        const scheduledMatches =
          matchesResult.status === 'fulfilled'
            ? matchesResult.value.map((m) => ({ ...m, id: m.slug }))
            : [];

        setFirestoreMatches(scheduledMatches);
        setMatches(scheduledMatches.map((m) => mapMatchToPrediction(m, teamsMap)));
      } catch {
        if (!cancelled) {
          setMatches([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const predictorId = `${user.uid}-default`;
    let cancelled = false;

    const fetchExistingBets = async () => {
      try {
        const { matchBets, knockoutBets } = await predictionService.getExistingBets(
          user.uid,
          predictorId,
        );

        if (cancelled) return;

        const betMatchIds = new Set<string>();
        matchBets.forEach((_, matchId) => betMatchIds.add(matchId));
        knockoutBets.forEach((_, matchId) => betMatchIds.add(matchId));
        setExistingBets(betMatchIds);
      } catch {
        // Silently fail - existing bets are optional
      }
    };

    fetchExistingBets();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = useCallback(
    async (predictions: Record<string, { home?: number; away?: number; winner?: string }>) => {
      if (!user) return;

      const predictorId = `${user.uid}-default`;
      setSubmitting(true);
      setFeedback(null);

      const result = await predictionService.submitBatchMatchBets(
        user.uid,
        predictorId,
        predictions,
        firestoreMatches,
      );

      setSubmitting(false);

      if (result.successCount > 0) {
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? `${result.successCount} prediction(s) submitted!`
              : `¡${result.successCount} predicción(es) enviadas!`,
        });

        const newBetIds = new Set(existingBets);
        Object.keys(predictions).forEach((id) => newBetIds.add(id));
        setExistingBets(newBetIds);
      }

      if (result.errors.length > 0) {
        setFeedback({
          type: 'error',
          message: result.errors[0],
        });
      }

      setTimeout(() => setFeedback(null), 5000);
    },
    [user, firestoreMatches, locale, existingBets],
  );

  if (loading || isAuthLoading) {
    return (
      <div className={`predictions-template ${className}`}>
        <div className="predictions-template__loading">
          <Spinner size="lg" />
          <Typography variant="body">{translations.loading}</Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`predictions-template ${className}`}>
        <div className="predictions-template__auth-required">
          <Typography variant="h1">{translations.title}</Typography>
          <Typography variant="body">{translations.loginRequired}</Typography>
          <a href={locale === 'en' ? '/en/login' : '/login'}>
            <Button variant="primary" size="md">
              {translations.loginButton}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const availableMatches = matches.filter((m) => !existingBets.has(m.matchId));

  return (
    <div className={`predictions-template ${className}`}>
      <main className="predictions-template__content">
        <header className="predictions-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        {feedback && (
          <div
            className={`predictions-template__feedback predictions-template__feedback--${feedback.type}`}
          >
            <Typography variant="small">{feedback.message}</Typography>
          </div>
        )}

        {availableMatches.length === 0 ? (
          <div className="predictions-template__empty">
            <Typography variant="body">
              {locale === 'en'
                ? 'No matches available for prediction. All scheduled matches have been predicted or deadlines have passed.'
                : 'No hay partidos disponibles para predecir. Todos los partidos programados han sido pronosticados o los plazos han pasado.'}
            </Typography>
          </div>
        ) : (
          <PredictionForm
            matches={availableMatches}
            onSubmit={handleSubmit}
            isDisabled={submitting}
          />
        )}
      </main>
    </div>
  );
};
