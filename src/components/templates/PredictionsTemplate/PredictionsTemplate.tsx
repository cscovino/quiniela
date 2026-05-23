import React, { useEffect, useState, useCallback } from 'react';
import { PredictionForm, type MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import {
  GroupPredictionForm,
  type GroupForPrediction,
} from '@organisms/GroupPredictionForm/GroupPredictionForm';
import { FinalPhaseForm } from '@organisms/FinalPhaseForm/FinalPhaseForm';
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

export interface PredictionsTemplateProps {
  translations: {
    title: string;
    noMatches: string;
    submitSuccess: string;
    submitError: string;
    loginRequired: string;
    loginButton: string;
    loading: string;
    stepMatches: string;
    stepMatchesDesc: string;
    stepGroups: string;
    stepGroupsDesc: string;
    stepFinalPhase: string;
    stepFinalPhaseDesc: string;
    stepBestPlayers: string;
    stepBestPlayersDesc: string;
    buttonNext: string;
    buttonBack: string;
    buttonSubmit: string;
    stepXofY: string;
    submitToAdvance: string;
    predictedStandings: string;
    team: string;
    pts: string;
  };
  locale?: 'en' | 'es';
  className?: string;
}

interface PredictedStanding {
  teamId: string;
  fifaCode: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
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

const calculatePredictedStandings = (
  matches: (Match & { id: string })[],
  predictions: Record<string, { home?: number; away?: number }>,
  teamsMap: Record<string, { fifaCode: string; name: string }>,
): Record<string, PredictedStanding[]> => {
  const groupStandings: Record<string, Record<string, PredictedStanding>> = {};

  for (const match of matches) {
    const pred = predictions[match.id];
    if (!pred || pred.home == null || pred.away == null) continue;
    if (!match.homeTeamId || !match.awayTeamId) continue;

    const groupId = match.groupId || 'unknown';
    if (!groupStandings[groupId]) groupStandings[groupId] = {};

    const initTeam = (teamId: string) => {
      if (!groupStandings[groupId][teamId]) {
        const team = teamsMap[teamId] || { fifaCode: teamId.toUpperCase(), name: teamId };
        groupStandings[groupId][teamId] = {
          teamId,
          fifaCode: team.fifaCode,
          name: team.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }
    };

    initTeam(match.homeTeamId);
    initTeam(match.awayTeamId);

    const home = groupStandings[groupId][match.homeTeamId];
    const away = groupStandings[groupId][match.awayTeamId];

    home.played++;
    away.played++;
    home.goalsFor += pred.home;
    home.goalsAgainst += pred.away;
    away.goalsFor += pred.away;
    away.goalsAgainst += pred.home;

    if (pred.home > pred.away) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (pred.home < pred.away) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  const result: Record<string, PredictedStanding[]> = {};
  for (const [groupId, teams] of Object.entries(groupStandings)) {
    result[groupId] = Object.values(teams).sort(
      (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
    );
  }

  return result;
};

export const PredictionsTemplate: React.FC<PredictionsTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const { user, isAuthLoading } = useAuthStore();

  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [selectedPredictorId, setSelectedPredictorId] = useState<string | null>(null);
  const [predictorsLoading, setPredictorsLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());
  const [matchPredictions, setMatchPredictions] = useState<
    Record<string, { home?: number; away?: number }>
  >({});

  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [firestoreMatches, setFirestoreMatches] = useState<(Match & { id: string })[]>([]);
  const [groups, setGroups] = useState<GroupForPrediction[]>([]);
  const [allTeams, setAllTeams] = useState<{ fifaCode: string; name: string }[]>([]);
  const [teamsMap, setTeamsMap] = useState<Record<string, { fifaCode: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [existingMatchBets, setExistingMatchBets] = useState<Set<string>>(new Set());
  const [existingGroupBets, setExistingGroupBets] = useState<Set<string>>(new Set());
  const [existingFinalPhase, setExistingFinalPhase] = useState<{
    first?: string;
    second?: string;
    third?: string;
    fourth?: string;
  } | null>(null);
  const [existingBestPlayers, setExistingBestPlayers] = useState<{
    bestGoalkeeper?: string;
    bestScorer?: string;
  } | null>(null);

  const TOTAL_STEPS = 4;

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

        const tMap: Record<string, { fifaCode: string; name: string }> = {};
        const teamsList: { fifaCode: string; name: string }[] = [];
        if (teamsResult.status === 'fulfilled') {
          teamsResult.value.forEach((t) => {
            tMap[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
            tMap[t.fifaCode] = { fifaCode: t.fifaCode, name: t.name };
            teamsList.push({ fifaCode: t.fifaCode, name: t.name });
          });
        }
        setAllTeams(teamsList);
        setTeamsMap(tMap);

        const allMatches =
          matchesResult.status === 'fulfilled'
            ? matchesResult.value.map((m) => ({ ...m, id: m.slug }))
            : [];

        const groupMatches = allMatches.filter((m) => m.phase === 'group');

        setFirestoreMatches(groupMatches);
        setMatches(groupMatches.map((m) => mapMatchToPrediction(m, tMap)));

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
        const { matchBets, groupBets } = await predictionService.getExistingBets(
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
      } catch {
        // Silently fail
      }
    };

    fetchExistingBets();
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId]);

  const handleMatchPredictionsChange = useCallback(
    (predictions: Record<string, { home?: number; away?: number; winner?: string }>) => {
      const cleaned: Record<string, { home?: number; away?: number }> = {};
      for (const [key, val] of Object.entries(predictions)) {
        if (val.home != null && val.away != null) {
          cleaned[key] = { home: val.home, away: val.away };
        }
      }
      setMatchPredictions(cleaned);
    },
    [],
  );

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
        setSubmittedSteps((prev) => new Set(prev).add(0));
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
        setSubmittedSteps((prev) => new Set(prev).add(1));
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

  const handleFinalPhaseSubmit = useCallback(
    async (data: { first?: string; second?: string; third?: string; fourth?: string }) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      try {
        setExistingFinalPhase(data);
        setSubmittedSteps((prev) => new Set(prev).add(2));
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? 'Final phase prediction submitted!'
              : '¡Predicción de fase final enviada!',
        });
      } catch {
        setFeedback({
          type: 'error',
          message:
            locale === 'en'
              ? 'Failed to submit final phase prediction'
              : 'Error al enviar predicción de fase final',
        });
      }

      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, locale],
  );

  const handleBestPlayersSubmit = useCallback(
    async (data: { bestGoalkeeper?: string; bestScorer?: string }) => {
      if (!user || !selectedPredictorId) return;

      setSubmitting(true);
      setFeedback(null);

      try {
        setExistingBestPlayers(data);
        setSubmittedSteps((prev) => new Set(prev).add(3));
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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
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
  const predictedStandings = calculatePredictedStandings(
    firestoreMatches,
    matchPredictions,
    teamsMap,
  );

  const stepLabels = [
    translations.stepMatches,
    translations.stepGroups,
    translations.stepFinalPhase,
    translations.stepBestPlayers,
  ];

  const canAdvance =
    currentStep === 0
      ? Object.keys(matchPredictions).length > 0
      : currentStep === 1
        ? true
        : currentStep === 2
          ? true
          : true;

  return (
    <div className={`predictions-template ${className}`}>
      <main className="predictions-template__content">
        <header className="predictions-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <div className="predictions-template__progress">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className={`predictions-template__progress-step ${index === currentStep ? 'active' : ''} ${submittedSteps.has(index) ? 'completed' : ''}`}
            >
              <span className="predictions-template__progress-number">
                {submittedSteps.has(index) ? '✓' : index + 1}
              </span>
              <span className="predictions-template__progress-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="predictions-template__step-counter">
          {translations.stepXofY
            .replace('{current}', String(currentStep + 1))
            .replace('{total}', String(TOTAL_STEPS))}
        </div>

        {feedback && (
          <div
            className={`predictions-template__feedback predictions-template__feedback--${feedback.type}`}
          >
            <Typography variant="small">{feedback.message}</Typography>
          </div>
        )}

        {currentStep === 0 && (
          <section className="predictions-template__section">
            <div className="predictions-template__section-header">
              <Typography variant="h2">{translations.stepMatches}</Typography>
              <Typography variant="body">{translations.stepMatchesDesc}</Typography>
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
                onPredictionsChange={handleMatchPredictionsChange}
                isDisabled={submitting}
              />
            )}
          </section>
        )}

        {currentStep === 1 && (
          <section className="predictions-template__section">
            <div className="predictions-template__section-header">
              <Typography variant="h2">{translations.stepGroups}</Typography>
              <Typography variant="body">{translations.stepGroupsDesc}</Typography>
            </div>

            {Object.keys(predictedStandings).length > 0 && (
              <div className="predictions-template__predicted-standings">
                <Typography variant="h3">{translations.predictedStandings}</Typography>
                {Object.entries(predictedStandings).map(([groupId, standings]) => (
                  <div key={groupId} className="predictions-template__predicted-group">
                    <Typography variant="small" className="predictions-template__group-name">
                      {groups.find((g) => g.slug === groupId)?.name || groupId}
                    </Typography>
                    <table className="predictions-template__predicted-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{translations.team}</th>
                          <th>P</th>
                          <th>W</th>
                          <th>D</th>
                          <th>L</th>
                          <th>GF</th>
                          <th>GA</th>
                          <th>{translations.pts}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s, i) => (
                          <tr key={s.teamId}>
                            <td>{i + 1}</td>
                            <td className="predictions-template__team-cell">{s.fifaCode}</td>
                            <td>{s.played}</td>
                            <td>{s.won}</td>
                            <td>{s.drawn}</td>
                            <td>{s.lost}</td>
                            <td>{s.goalsFor}</td>
                            <td>{s.goalsAgainst}</td>
                            <td className="predictions-template__pts-cell">{s.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

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
        )}

        {currentStep === 2 && (
          <section className="predictions-template__section">
            <div className="predictions-template__section-header">
              <Typography variant="h2">{translations.stepFinalPhase}</Typography>
              <Typography variant="body">{translations.stepFinalPhaseDesc}</Typography>
            </div>
            {allTeams.length > 0 ? (
              <FinalPhaseForm
                teams={allTeams}
                onSubmit={handleFinalPhaseSubmit}
                existingPrediction={existingFinalPhase || undefined}
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
        )}

        {currentStep === 3 && (
          <section className="predictions-template__section">
            <div className="predictions-template__section-header">
              <Typography variant="h2">{translations.stepBestPlayers}</Typography>
              <Typography variant="body">{translations.stepBestPlayersDesc}</Typography>
            </div>
            <BestPlayersForm
              onSubmit={handleBestPlayersSubmit}
              existingPrediction={existingBestPlayers || undefined}
              isDisabled={submitting}
            />
          </section>
        )}

        <div className="predictions-template__navigation">
          <Button variant="secondary" size="md" onClick={handleBack} disabled={currentStep === 0}>
            {translations.buttonBack}
          </Button>
          {currentStep < TOTAL_STEPS - 1 && (
            <Button variant="primary" size="md" onClick={handleNext} disabled={!canAdvance}>
              {translations.buttonNext}
            </Button>
          )}
        </div>

        {!submittedSteps.has(currentStep) && (
          <div className="predictions-template__hint">
            <Typography variant="small">{translations.submitToAdvance}</Typography>
          </div>
        )}
      </main>
    </div>
  );
};
