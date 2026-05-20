import React, { useEffect, useState, useCallback } from 'react';
import { PredictionForm, type MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import {
  GroupPredictionForm,
  type GroupForPrediction,
} from '@organisms/GroupPredictionForm/GroupPredictionForm';
import {
  KnockoutBracketForm,
  type KnockoutMatch,
} from '@organisms/KnockoutBracketForm/KnockoutBracketForm';
import { BestPlayersForm } from '@organisms/BestPlayersForm/BestPlayersForm';
import { PredictorSelector } from '@molecules/PredictorSelector/PredictorSelector';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { Button } from '@atoms/Button/Button';
import { tournamentService } from '@services/tournament-service';
import { predictionService } from '@services/prediction-service';
import { predictorService } from '@services/predictor-service';
import { useAuthStore } from '@store/auth-store';
import type { Match, Predictor } from '@types/firestore';
import './PredictionsTemplate.css';

const PHASE_LABELS: Record<string, { en: string; es: string }> = {
  'round-of-32': { en: 'Round of 32', es: 'Treintaidosavos' },
  'round-of-16': { en: 'Round of 16', es: 'Octavos de Final' },
  quarterfinals: { en: 'Quarterfinals', es: 'Cuartos de Final' },
  semifinals: { en: 'Semifinals', es: 'Semifinales' },
  'third-place': { en: 'Third Place', es: 'Tercer Lugar' },
  final: { en: 'Final', es: 'Final' },
};

const FINAL_FOUR_PHASES = ['semifinals', 'third-place', 'final'];

export interface PredictionsTemplateProps {
  translations: {
    title: string;
    noMatches: string;
    submitSuccess: string;
    submitError: string;
    loginRequired: string;
    loginButton: string;
    loading: string;
    sectionMatches: string;
    sectionMatchesDesc: string;
    sectionGroups: string;
    sectionGroupsDesc: string;
    sectionFinalFour: string;
    sectionFinalFourDesc: string;
    sectionBestPlayers: string;
    sectionBestPlayersDesc: string;
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

  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [selectedPredictorId, setSelectedPredictorId] = useState<string | null>(null);
  const [predictorsLoading, setPredictorsLoading] = useState(true);

  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [firestoreMatches, setFirestoreMatches] = useState<(Match & { id: string })[]>([]);
  const [groups, setGroups] = useState<GroupForPrediction[]>([]);
  const [allTeams, setAllTeams] = useState<{ fifaCode: string; name: string }[]>([]);
  const [finalFourMatches, setFinalFourMatches] = useState<KnockoutMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [existingMatchBets, setExistingMatchBets] = useState<Set<string>>(new Set());
  const [existingGroupBets, setExistingGroupBets] = useState<Set<string>>(new Set());
  const [existingFinalFourBets, setExistingFinalFourBets] = useState<Set<string>>(new Set());
  const [existingBestPlayers, setExistingBestPlayers] = useState<{
    bestGoalkeeper?: string;
    bestScorer?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchPredictors = async () => {
      try {
        const userPredictors = await predictorService.getUserPredictors(user.uid);
        if (cancelled) return;

        setPredictors(userPredictors);

        if (userPredictors.length > 0) {
          const defaultPredictor = userPredictors.find((p) => p.id === `${user.uid}-default`);
          setSelectedPredictorId(defaultPredictor?.id || userPredictors[0].id);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) {
          setPredictorsLoading(false);
        }
      }
    };

    fetchPredictors();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [matchesResult, teamsResult, groupsResult] = await Promise.allSettled([
          tournamentService.getMatches(),
          tournamentService.getTeams(),
          tournamentService.getGroups(),
        ]);

        if (cancelled) return;

        const teamsMap: Record<string, { fifaCode: string; name: string }> = {};
        const teamsList: { fifaCode: string; name: string }[] = [];
        if (teamsResult.status === 'fulfilled') {
          teamsResult.value.forEach((t) => {
            teamsMap[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
            teamsMap[t.fifaCode] = { fifaCode: t.fifaCode, name: t.name };
            teamsList.push({ fifaCode: t.fifaCode, name: t.name });
          });
        }
        setAllTeams(teamsList);

        const allMatches =
          matchesResult.status === 'fulfilled'
            ? matchesResult.value.map((m) => ({ ...m, id: m.slug }))
            : [];

        const groupMatches = allMatches.filter((m) => m.phase === 'group');
        const knockoutMatchesData = allMatches.filter((m) => m.phase !== 'group');
        const finalFourData = knockoutMatchesData.filter((m) =>
          FINAL_FOUR_PHASES.includes(m.phase),
        );

        setFirestoreMatches(groupMatches);
        setMatches(groupMatches.map((m) => mapMatchToPrediction(m, teamsMap)));

        const finalFourMapped: KnockoutMatch[] = finalFourData.map((m) => ({
          slug: m.id,
          phase: m.phase,
          phaseLabel: PHASE_LABELS[m.phase]?.[locale === 'en' ? 'en' : 'es'] || m.phase,
          homeTeam: m.homeTeamId ? teamsMap[m.homeTeamId] || null : null,
          awayTeam: m.awayTeamId ? teamsMap[m.awayTeamId] || null : null,
          predictionDeadline: m.predictionDeadline.toDate(),
        }));
        setFinalFourMatches(finalFourMapped);

        if (groupsResult.status === 'fulfilled' && teamsResult.status === 'fulfilled') {
          const sortedGroups = [...groupsResult.value].sort((a, b) => a.order - b.order);
          const groupsForPrediction: GroupForPrediction[] = sortedGroups.map((group) => ({
            slug: group.slug,
            name: group.name,
            teams: teamsResult.value
              .filter((t) => t.groupId === group.slug)
              .map((t) => ({ fifaCode: t.fifaCode, name: t.name })),
          }));
          setGroups(groupsForPrediction);
        }
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
  }, [locale]);

  useEffect(() => {
    if (!user || !selectedPredictorId) return;

    let cancelled = false;

    const fetchExistingBets = async () => {
      try {
        const { matchBets, knockoutBets, groupBets } = await predictionService.getExistingBets(
          user.uid,
          selectedPredictorId,
        );

        if (cancelled) return;

        const matchBetIds = new Set<string>();
        matchBets.forEach((_, matchId) => matchBetIds.add(matchId));
        setExistingMatchBets(matchBetIds);

        const groupBetIds = new Set<string>();
        groupBets.forEach((_, groupId) => groupBetIds.add(groupId));
        setExistingGroupBets(groupBetIds);

        const finalFourIds = new Set<string>();
        knockoutBets.forEach((_, matchId) => {
          const match = finalFourMatches.find((m) => m.slug === matchId);
          if (match) finalFourIds.add(matchId);
        });
        setExistingFinalFourBets(finalFourIds);
      } catch {
        // Silently fail
      }
    };

    fetchExistingBets();
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId, finalFourMatches]);

  const handleMatchSubmit = useCallback(
    async (predictions: Record<string, { home?: number; away?: number; winner?: string }>) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      const result = await predictionService.submitBatchMatchBets(
        user.uid,
        selectedPredictorId,
        predictions,
        firestoreMatches,
      );

      setSubmitting(false);

      if (result.successCount > 0) {
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? `${result.successCount} match prediction(s) submitted!`
              : `¡${result.successCount} predicción(es) de partidos enviadas!`,
        });

        const newBetIds = new Set(existingMatchBets);
        Object.keys(predictions).forEach((id) => newBetIds.add(id));
        setExistingMatchBets(newBetIds);
      }

      if (result.errors.length > 0) {
        setFeedback({
          type: 'error',
          message: result.errors[0],
        });
      }

      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, firestoreMatches, locale, existingMatchBets],
  );

  const handleGroupSubmit = useCallback(
    async (predictions: Record<string, string[]>) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      const result = await predictionService.submitBatchGroupBets(
        user.uid,
        selectedPredictorId,
        predictions,
      );

      setSubmitting(false);

      if (result.successCount > 0) {
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? `${result.successCount} group prediction(s) submitted!`
              : `¡${result.successCount} predicción(es) de grupos enviadas!`,
        });

        const newBetIds = new Set(existingGroupBets);
        Object.keys(predictions).forEach((id) => newBetIds.add(id));
        setExistingGroupBets(newBetIds);
      }

      if (result.errors.length > 0) {
        setFeedback({
          type: 'error',
          message: result.errors[0],
        });
      }

      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, locale, existingGroupBets],
  );

  const handleFinalFourSubmit = useCallback(
    async (predictions: Record<string, string>) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      const results = await Promise.all(
        Object.entries(predictions).map(async ([matchId, winner]) => {
          return predictionService.submitKnockoutBet(
            user.uid,
            selectedPredictorId,
            matchId,
            winner,
          );
        }),
      );

      setSubmitting(false);

      const successCount = results.filter((r) => r.success).length;
      const firstError = results.find((r) => !r.success)?.error;

      if (successCount > 0) {
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? `${successCount} final four prediction(s) submitted!`
              : `¡${successCount} predicción(es) de fase final enviadas!`,
        });

        const newBetIds = new Set(existingFinalFourBets);
        Object.keys(predictions).forEach((id) => newBetIds.add(id));
        setExistingFinalFourBets(newBetIds);
      }

      if (firstError) {
        setFeedback({
          type: 'error',
          message: firstError,
        });
      }

      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, locale, existingFinalFourBets],
  );

  const handleBestPlayersSubmit = useCallback(
    async (data: { bestGoalkeeper?: string; bestScorer?: string }) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      try {
        setExistingBestPlayers(data);
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? 'Best players prediction submitted!'
              : '¡Predicción de mejores jugadores enviada!',
        });
      } catch {
        setFeedback({
          type: 'error',
          message:
            locale === 'en'
              ? 'Failed to submit best players prediction'
              : 'Error al enviar predicción de mejores jugadores',
        });
      }

      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, locale],
  );

  const handleCreatePredictor = async (name: string) => {
    if (!user) return;

    const newPredictor = await predictorService.createPredictor(user.uid, name);
    setPredictors((prev) => [...prev, newPredictor]);
    setSelectedPredictorId(newPredictor.id);
  };

  if (loading || isAuthLoading || predictorsLoading) {
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

  if (!selectedPredictorId) {
    const predictorTranslations = {
      title: locale === 'en' ? 'Choose Your Predictor' : 'Elige tu Pronosticador',
      selectPredictor:
        locale === 'en'
          ? 'Select or create a predictor to start'
          : 'Selecciona o crea un pronosticador para comenzar',
      createPredictor: locale === 'en' ? 'Create New Predictor' : 'Crear Nuevo Pronosticador',
      createButton: locale === 'en' ? 'Create' : 'Crear',
      namePlaceholder: locale === 'en' ? 'Predictor name...' : 'Nombre del pronosticador...',
      loading: locale === 'en' ? 'Loading predictors...' : 'Cargando pronosticadores...',
      noPredictors: locale === 'en' ? 'No predictors yet' : 'Aún no hay pronosticadores',
      getStarted: locale === 'en' ? 'Get Started' : 'Comenzar',
    };

    return (
      <div className={`predictions-template ${className}`}>
        <main className="predictions-template__content">
          <PredictorSelector
            predictors={predictors}
            selectedPredictorId={selectedPredictorId}
            onSelectPredictor={setSelectedPredictorId}
            onCreatePredictor={handleCreatePredictor}
            isLoading={predictorsLoading}
            translations={predictorTranslations}
          />
        </main>
      </div>
    );
  }

  const availableMatches = matches.filter((m) => !existingMatchBets.has(m.matchId));
  const availableFinalFour = finalFourMatches.filter((m) => !existingFinalFourBets.has(m.slug));

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

        <section className="predictions-template__section">
          <div className="predictions-template__section-header">
            <Typography variant="h2">{translations.sectionMatches}</Typography>
            <Typography variant="body">{translations.sectionMatchesDesc}</Typography>
          </div>
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
              onSubmit={handleMatchSubmit}
              isDisabled={submitting}
            />
          )}
        </section>

        <div className="predictions-template__divider" />

        <section className="predictions-template__section">
          <div className="predictions-template__section-header">
            <Typography variant="h2">{translations.sectionGroups}</Typography>
            <Typography variant="body">{translations.sectionGroupsDesc}</Typography>
          </div>
          {groups.length > 0 ? (
            <GroupPredictionForm
              groups={groups}
              onSubmit={handleGroupSubmit}
              existingBets={existingGroupBets}
              isDisabled={submitting}
            />
          ) : (
            <div className="predictions-template__empty">
              <Typography variant="body">
                {locale === 'en'
                  ? 'Group predictions will be available once groups are confirmed.'
                  : 'Las predicciones de grupos estarán disponibles una vez confirmados los grupos.'}
              </Typography>
            </div>
          )}
        </section>

        <div className="predictions-template__divider" />

        <section className="predictions-template__section">
          <div className="predictions-template__section-header">
            <Typography variant="h2">{translations.sectionFinalFour}</Typography>
            <Typography variant="body">{translations.sectionFinalFourDesc}</Typography>
          </div>
          {availableFinalFour.length > 0 ? (
            <KnockoutBracketForm
              matches={availableFinalFour}
              onSubmit={handleFinalFourSubmit}
              existingBets={existingFinalFourBets}
              isDisabled={submitting}
            />
          ) : (
            <div className="predictions-template__empty">
              <Typography variant="body">
                {locale === 'en'
                  ? 'Final four predictions will be available once teams are determined.'
                  : 'Las predicciones de la fase final estarán disponibles una vez determinados los equipos.'}
              </Typography>
            </div>
          )}
        </section>

        <div className="predictions-template__divider" />

        <section className="predictions-template__section">
          <div className="predictions-template__section-header">
            <Typography variant="h2">{translations.sectionBestPlayers}</Typography>
            <Typography variant="body">{translations.sectionBestPlayersDesc}</Typography>
          </div>
          {allTeams.length > 0 ? (
            <BestPlayersForm
              teams={allTeams}
              onSubmit={handleBestPlayersSubmit}
              existingPrediction={existingBestPlayers || undefined}
              isDisabled={submitting}
            />
          ) : (
            <div className="predictions-template__empty">
              <Typography variant="body">
                {locale === 'en'
                  ? 'Teams will be available soon.'
                  : 'Los equipos estarán disponibles pronto.'}
              </Typography>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
