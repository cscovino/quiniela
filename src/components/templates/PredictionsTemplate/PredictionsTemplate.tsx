import React, { useEffect, useState, useCallback } from 'react';
import { type MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import { type GroupForPrediction } from '@organisms/GroupPredictionForm/GroupPredictionForm';
import { PredictorSelector } from '@molecules/PredictorSelector/PredictorSelector';
import {
  PredictionsProgress,
  PredictionsFeedback,
  PredictionsNavigation,
} from '@molecules/Predictions/PredictionsUI';
import { PredictionStepMatches } from '@molecules/Predictions/PredictionStepMatches';
import { PredictionStepGroups } from '@molecules/Predictions/PredictionStepGroups';
import {
  PredictionStepFinalPhase,
  PredictionStepBestPlayers,
} from '@molecules/Predictions/PredictionStepFinal';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
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

const TOTAL_STEPS = 4;

export const PredictionsTemplate: React.FC<PredictionsTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    predictorService
      .getUserPredictors(user.uid)
      .then((p) => {
        if (cancelled) return;
        setPredictors(p);
        if (p.length > 0) {
          const def = p.find((x) => x.id === `${user.uid}-default`);
          setSelectedPredictorId(def?.id || p[0].id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPredictorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      tournamentService.getMatches(),
      tournamentService.getTeams(),
      tournamentService.getGroups(),
    ])
      .then(([m, t, g]) => {
        if (cancelled) return;
        const tMap: Record<string, { fifaCode: string; name: string }> = {};
        const teamsList: { fifaCode: string; name: string }[] = [];
        if (t.status === 'fulfilled') {
          t.value.forEach((x) => {
            tMap[x.fifaCode.toLowerCase()] = { fifaCode: x.fifaCode, name: x.name };
            tMap[x.fifaCode] = { fifaCode: x.fifaCode, name: x.name };
            teamsList.push({ fifaCode: x.fifaCode, name: x.name });
          });
        }
        setAllTeams(teamsList);
        setTeamsMap(tMap);
        const all = m.status === 'fulfilled' ? m.value.map((x) => ({ ...x, id: x.slug })) : [];
        const groupM = all.filter((x) => x.phase === 'group');
        setFirestoreMatches(groupM);
        setMatches(groupM.map((x) => mapMatchToPrediction(x, tMap)));
        if (g.status === 'fulfilled' && t.status === 'fulfilled') {
          setGroups(
            [...g.value]
              .sort((a, b) => a.order - b.order)
              .map((grp) => ({
                slug: grp.slug,
                name: grp.name,
                teams: t.value
                  .filter((x) => x.groupId === grp.slug)
                  .map((x) => ({ fifaCode: x.fifaCode, name: x.name })),
              })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setMatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!user || !selectedPredictorId) return;
    let cancelled = false;
    predictionService
      .getExistingBets(user.uid, selectedPredictorId)
      .then(({ matchBets, groupBets }) => {
        if (cancelled) return;
        setExistingMatchBets(new Set(matchBets.keys()));
        setExistingGroupBets(new Set(groupBets.keys()));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId]);

  const handleMatchPredictionsChange = useCallback(
    (p: Record<string, { home?: number; away?: number; winner?: string }>) => {
      const cleaned: Record<string, { home?: number; away?: number }> = {};
      for (const [k, v] of Object.entries(p)) {
        if (v.home != null && v.away != null) cleaned[k] = { home: v.home, away: v.away };
      }
      setMatchPredictions(cleaned);
    },
    [],
  );

  const withFeedback = useCallback(
    async (
      fn: () => Promise<{ successCount: number; errors: string[] }>,
      successKey: string,
      stepIndex: number,
    ) => {
      setSubmitting(true);
      setFeedback(null);
      const result = await fn();
      setSubmitting(false);
      if (result.successCount > 0) {
        setFeedback({
          type: 'success',
          message:
            locale === 'en'
              ? `${result.successCount} prediction(s) submitted!`
              : `¡${result.successCount} predicción(es) enviadas!`,
        });
        setSubmittedSteps((prev) => new Set(prev).add(stepIndex));
      }
      if (result.errors.length > 0) setFeedback({ type: 'error', message: result.errors[0] });
      setTimeout(() => setFeedback(null), 5000);
    },
    [locale],
  );

  const handleMatchSubmit = useCallback(
    async (p: Record<string, { home?: number; away?: number; winner?: string }>) => {
      if (!user || !selectedPredictorId) return;
      await withFeedback(
        () =>
          predictionService.submitBatchMatchBets(
            user.uid,
            selectedPredictorId,
            p,
            firestoreMatches,
          ),
        'match',
        0,
      );
      const newBets = new Set(existingMatchBets);
      Object.keys(p).forEach((id) => newBets.add(id));
      setExistingMatchBets(newBets);
    },
    [user, selectedPredictorId, firestoreMatches, withFeedback, existingMatchBets],
  );

  const handleGroupSubmit = useCallback(
    async (p: Record<string, string[]>) => {
      if (!user || !selectedPredictorId) return;
      await withFeedback(
        () => predictionService.submitBatchGroupBets(user.uid, selectedPredictorId, p),
        'group',
        1,
      );
      const newBets = new Set(existingGroupBets);
      Object.keys(p).forEach((id) => newBets.add(id));
      setExistingGroupBets(newBets);
    },
    [user, selectedPredictorId, withFeedback, existingGroupBets],
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
          message: locale === 'en' ? 'Final phase submitted!' : '¡Fase final enviada!',
        });
      } catch {
        setFeedback({
          type: 'error',
          message: locale === 'en' ? 'Failed to submit' : 'Error al enviar',
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
          message: locale === 'en' ? 'Best players submitted!' : '¡Mejores jugadores enviados!',
        });
      } catch {
        setFeedback({
          type: 'error',
          message: locale === 'en' ? 'Failed to submit' : 'Error al enviar',
        });
      }
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, locale],
  );

  const handleCreatePredictor = async (name: string) => {
    if (!user) return;
    const np = await predictorService.createPredictor(user.uid, name);
    setPredictors((prev) => [...prev, np]);
    setSelectedPredictorId(np.id);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) setCurrentStep((p) => p + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
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
            <button type="button" className="predictions-template__login-btn">
              {translations.loginButton}
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (!selectedPredictorId) {
    const pt = {
      title: locale === 'en' ? 'Choose Your Predictor' : 'Elige tu Pronosticador',
      selectPredictor:
        locale === 'en'
          ? 'Select or create a predictor to start'
          : 'Selecciona o crea un pronosticador',
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
            translations={pt}
          />
        </main>
      </div>
    );
  }

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
  const canAdvance = currentStep === 0 ? Object.keys(matchPredictions).length > 0 : true;
  const stepCounter = translations.stepXofY
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(TOTAL_STEPS));

  return (
    <div className={`predictions-template ${className}`}>
      <main className="predictions-template__content">
        <header className="predictions-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <PredictionsProgress
          stepLabels={stepLabels}
          currentStep={currentStep}
          submittedSteps={submittedSteps}
          stepCounter={stepCounter}
        />
        <PredictionsFeedback feedback={feedback} />

        <section className="predictions-template__section">
          <div className="predictions-template__section-header">
            <Typography variant="h2">{stepLabels[currentStep]}</Typography>
            <Typography variant="body">
              {currentStep === 0
                ? translations.stepMatchesDesc
                : currentStep === 1
                  ? translations.stepGroupsDesc
                  : currentStep === 2
                    ? translations.stepFinalPhaseDesc
                    : translations.stepBestPlayersDesc}
            </Typography>
          </div>

          {currentStep === 0 && (
            <PredictionStepMatches
              matches={matches}
              existingMatchBets={existingMatchBets}
              teamsMap={teamsMap}
              onSubmit={handleMatchSubmit}
              onPredictionsChange={handleMatchPredictionsChange}
              isDisabled={submitting}
              locale={locale}
            />
          )}
          {currentStep === 1 && (
            <PredictionStepGroups
              groups={groups}
              predictedStandings={predictedStandings}
              existingGroupBets={existingGroupBets}
              onSubmit={handleGroupSubmit}
              isDisabled={submitting}
              locale={locale}
              translations={translations}
            />
          )}
          {currentStep === 2 && (
            <PredictionStepFinalPhase
              teams={allTeams}
              existingPrediction={existingFinalPhase || undefined}
              onSubmit={handleFinalPhaseSubmit}
              isDisabled={submitting}
              locale={locale}
            />
          )}
          {currentStep === 3 && (
            <PredictionStepBestPlayers
              existingPrediction={existingBestPlayers || undefined}
              onSubmit={handleBestPlayersSubmit}
              isDisabled={submitting}
            />
          )}
        </section>

        <PredictionsNavigation
          onBack={handleBack}
          onNext={handleNext}
          canAdvance={canAdvance}
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          translations={translations}
          submittedSteps={submittedSteps}
        />
      </main>
    </div>
  );
};
