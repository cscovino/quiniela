import { useState, useCallback, useMemo, useEffect } from 'react';
import type { MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import type { GroupForPrediction } from '@organisms/GroupPredictionForm/GroupPredictionForm';
import { tournamentService } from '@services/tournament-service';
import { predictionService } from '@services/prediction-service';
import { useAuthStore } from '@store/auth-store';
import type { Match } from '@app-types/firestore';
import { calculateGroupStandings as calculateGroupStanding } from '@utils/predictions-flow';
import type { PredictionStepModel } from '@types/prediction-steps';
import { PredictionStepMatches } from '@molecules/Predictions/PredictionStepMatches';
import { PredictionStepGroups } from '@molecules/Predictions/PredictionStepGroups';
import {
  PredictionStepFinalPhase,
  PredictionStepBestPlayers,
} from '@molecules/Predictions/PredictionStepFinal';

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
  const groupIds = [...new Set(matches.filter((m) => m.phase === 'group').map((m) => m.groupId))];
  const result: Record<string, PredictedStanding[]> = {};

  for (const groupId of groupIds) {
    const standings = calculateGroupStanding(matches, predictions, teamsMap, groupId);
    if (standings.length > 0) {
      result[groupId] = standings;
    }
  }

  return result;
};

export interface UsePredictionStepsResult {
  loading: boolean;
  steps: PredictionStepModel[];
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  submittedSteps: Set<number>;
  feedback: { type: 'success' | 'error'; message: string } | null;
  submitting: boolean;
  totalSteps: number;
  canAdvance: boolean;
  predictedStandings: Record<string, PredictedStanding[]>;
  allTeams: { fifaCode: string; name: string }[];
  teamsMap: Record<string, { fifaCode: string; name: string }>;
  groups: GroupForPrediction[];
  matches: MatchPrediction[];
  firestoreMatches: (Match & { id: string })[];
}

export function usePredictionSteps(
  translations: {
    stepMatches: string;
    stepMatchesDesc: string;
    stepGroups: string;
    stepGroupsDesc: string;
    stepFinalPhase: string;
    stepFinalPhaseDesc: string;
    stepBestPlayers: string;
    stepBestPlayersDesc: string;
    feedback: {
      submittedCount: string;
      finalPhaseSubmitted: string;
      bestPlayersSubmitted: string;
      submitFailed: string;
    };
  },
  locale: 'en' | 'es',
  selectedPredictorId: string | null,
): UsePredictionStepsResult {
  const user = useAuthStore((s) => s.user);

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
      .then(({ matchBets, groupBets, finalPhase, bestPlayers }) => {
        if (cancelled) return;
        setExistingMatchBets(new Set(matchBets.keys()));
        setExistingGroupBets(new Set(groupBets.keys()));
        if (finalPhase) {
          setExistingFinalPhase({
            first: finalPhase.first,
            second: finalPhase.second,
            third: finalPhase.third,
            fourth: finalPhase.fourth,
          });
          setSubmittedSteps((prev) => new Set(prev).add(2));
        }
        if (bestPlayers) {
          setExistingBestPlayers({
            bestGoalkeeper: bestPlayers.bestGoalkeeper,
            bestScorer: bestPlayers.bestScorer,
          });
          setSubmittedSteps((prev) => new Set(prev).add(3));
        }
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
          message: translations.feedback.submittedCount.replace(
            '{count}',
            String(result.successCount),
          ),
        });
        setSubmittedSteps((prev) => new Set(prev).add(stepIndex));
      }
      if (result.errors.length > 0) setFeedback({ type: 'error', message: result.errors[0] });
      setTimeout(() => setFeedback(null), 5000);
    },
    [translations],
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
        const result = await predictionService.submitFinalPhaseBet(
          user.uid,
          selectedPredictorId,
          data as { first: string; second: string; third: string; fourth: string },
        );
        if (result.success) {
          setExistingFinalPhase(data);
          setSubmittedSteps((prev) => new Set(prev).add(2));
          setFeedback({
            type: 'success',
            message: translations.feedback.finalPhaseSubmitted,
          });
        } else {
          setFeedback({
            type: 'error',
            message: result.error || translations.feedback.submitFailed,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: translations.feedback.submitFailed,
        });
      }
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, translations],
  );

  const handleBestPlayersSubmit = useCallback(
    async (data: { bestGoalkeeper?: string; bestScorer?: string }) => {
      if (!user || !selectedPredictorId) return;
      setSubmitting(true);
      setFeedback(null);
      try {
        const result = await predictionService.submitBestPlayersBet(
          user.uid,
          selectedPredictorId,
          data as { bestGoalkeeper: string; bestScorer: string },
        );
        if (result.success) {
          setExistingBestPlayers(data);
          setSubmittedSteps((prev) => new Set(prev).add(3));
          setFeedback({
            type: 'success',
            message: translations.feedback.bestPlayersSubmitted,
          });
        } else {
          setFeedback({
            type: 'error',
            message: result.error || translations.feedback.submitFailed,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: translations.feedback.submitFailed,
        });
      }
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, translations],
  );

  const predictedStandings = useMemo(
    () => calculatePredictedStandings(firestoreMatches, matchPredictions, teamsMap),
    [firestoreMatches, matchPredictions, teamsMap],
  );

  const steps: PredictionStepModel[] = useMemo(() => {
    return [
      {
        id: 'matches',
        label: translations.stepMatches,
        description: translations.stepMatchesDesc,
        isComplete: submittedSteps.has(0),
        canAdvance: Object.keys(matchPredictions).length > 0,
        content: (
          <PredictionStepMatches
            matches={matches}
            existingMatchBets={existingMatchBets}
            teamsMap={teamsMap}
            onSubmit={handleMatchSubmit}
            onPredictionsChange={handleMatchPredictionsChange}
            isDisabled={submitting}
            locale={locale}
          />
        ),
        onSubmit: () => Promise.resolve(),
      },
      {
        id: 'groups',
        label: translations.stepGroups,
        description: translations.stepGroupsDesc,
        isComplete: submittedSteps.has(1),
        content: (
          <PredictionStepGroups
            groups={groups}
            predictedStandings={predictedStandings}
            existingGroupBets={existingGroupBets}
            onSubmit={handleGroupSubmit}
            isDisabled={submitting}
            locale={locale}
            translations={{
              stepGroups: translations.stepGroups,
              stepGroupsDesc: translations.stepGroupsDesc,
              predictedStandings: '',
              team: '',
              pts: '',
            }}
          />
        ),
        onSubmit: () => Promise.resolve(),
      },
      {
        id: 'final-phase',
        label: translations.stepFinalPhase,
        description: translations.stepFinalPhaseDesc,
        isComplete: submittedSteps.has(2),
        content: (
          <PredictionStepFinalPhase
            teams={allTeams}
            existingPrediction={existingFinalPhase || undefined}
            onSubmit={handleFinalPhaseSubmit}
            isDisabled={submitting}
            locale={locale}
          />
        ),
        onSubmit: () => Promise.resolve(),
      },
      {
        id: 'best-players',
        label: translations.stepBestPlayers,
        description: translations.stepBestPlayersDesc,
        isComplete: submittedSteps.has(3),
        content: (
          <PredictionStepBestPlayers
            existingPrediction={existingBestPlayers || undefined}
            onSubmit={handleBestPlayersSubmit}
            isDisabled={submitting}
          />
        ),
        onSubmit: () => Promise.resolve(),
      },
    ];
  }, [
    translations,
    submittedSteps,
    matchPredictions,
    matches,
    existingMatchBets,
    teamsMap,
    handleMatchSubmit,
    handleMatchPredictionsChange,
    submitting,
    locale,
    groups,
    predictedStandings,
    existingGroupBets,
    handleGroupSubmit,
    allTeams,
    existingFinalPhase,
    handleFinalPhaseSubmit,
    existingBestPlayers,
    handleBestPlayersSubmit,
  ]);

  const canAdvance = steps[currentStep]?.canAdvance ?? true;

  return {
    loading,
    steps,
    currentStep,
    setCurrentStep,
    submittedSteps,
    feedback,
    submitting,
    totalSteps: steps.length,
    canAdvance,
    predictedStandings,
    allTeams,
    teamsMap,
    groups,
    matches,
    firestoreMatches,
  };
}
