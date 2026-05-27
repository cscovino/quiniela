import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Match } from '@app-types/firestore';
import type { ThirdPlacedTeam } from '@app-types/prediction-steps';
import { PredictionStepGroup } from '@molecules/Predictions';
import { PredictionStepKnockoutRound } from '@molecules/Predictions';
import { PredictionStepBestPlayers, PredictionStepFinalPhase } from '@molecules/Predictions';
import type { GroupForPrediction } from '@organisms/GroupPredictionForm';
import { predictionService } from '@services/prediction-service';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import {
  computeThirdPlaceStandings,
  isGroupClassificationComplete,
  KNOCKOUT_PHASES,
} from '@utils/predictions-flow';

import type { PredictionStepModel } from '../types/prediction-steps';

const KNOCKOUT_PHASE_LABELS: Record<string, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  'third-place': 'Third Place',
  final: 'Final',
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
  allTeams: { fifaCode: string; name: string }[];
  teamsMap: Record<string, { fifaCode: string; name: string }>;
  groups: GroupForPrediction[];
  firestoreMatches: (Match & { id: string })[];
  thirdPlaceTeams: ThirdPlacedTeam[];
}

export function usePredictionSteps(
  translations: {
    stepFinalPhase: string;
    stepFinalPhaseDesc: string;
    stepBestPlayers: string;
    stepBestPlayersDesc: string;
    stepDescriptionGroup?: string;
    stepDescriptionRound?: string;
    feedback: {
      submittedCount: string;
      finalPhaseSubmitted: string;
      bestPlayersSubmitted: string;
      submitFailed: string;
    };
  },
  locale: 'en' | 'es',
  selectedPredictorId: string | null,
  deadline: Date | null = null,
): UsePredictionStepsResult {
  const user = useAuthStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

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

  const [groupBetsByGroupId, setGroupBetsByGroupId] = useState<Record<string, string[]>>({});
  const [knockoutBetsByMatchSlug, setKnockoutBetsByMatchSlug] = useState<Record<string, string>>(
    {},
  );

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
        setFirestoreMatches(all);
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
        if (!cancelled) setFirestoreMatches([]);
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
      .then(({ matchBets, groupBets, finalPhase, bestPlayers, knockoutBets }) => {
        if (cancelled) return;
        setExistingMatchBets(new Set(matchBets.keys()));

        const groupBetsRecord: Record<string, string[]> = {};
        groupBets.forEach((positions, groupId) => {
          groupBetsRecord[groupId] = positions;
        });
        setGroupBetsByGroupId(groupBetsRecord);

        const knockoutBetsRecord: Record<string, string> = {};
        knockoutBets.forEach((winner, slug) => {
          knockoutBetsRecord[slug] = winner;
        });
        setKnockoutBetsByMatchSlug(knockoutBetsRecord);

        if (finalPhase) {
          setExistingFinalPhase({
            first: finalPhase.first,
            second: finalPhase.second,
            third: finalPhase.third,
            fourth: finalPhase.fourth,
          });
        }
        if (bestPlayers) {
          setExistingBestPlayers({
            bestGoalkeeper: bestPlayers.bestGoalkeeper,
            bestScorer: bestPlayers.bestScorer,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId]);

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
          const finalPhaseIndex = groups.length + KNOCKOUT_PHASES.length;
          setSubmittedSteps((prev) => new Set(prev).add(finalPhaseIndex));
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
    [user, selectedPredictorId, translations, groups.length],
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
          const bestPlayersIndex = groups.length + KNOCKOUT_PHASES.length + 1;
          setSubmittedSteps((prev) => new Set(prev).add(bestPlayersIndex));
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
    [user, selectedPredictorId, translations, groups.length],
  );

  const handleGroupStepSubmit = useCallback(
    async (
      groupId: string,
      stepIndex: number,
      data: {
        matchPredictions: Record<string, { home: number; away: number }>;
        classification: string[];
      },
    ) => {
      if (!user || !selectedPredictorId) return;
      setSubmitting(true);
      setFeedback(null);

      const errors: string[] = [];
      let successCount = 0;

      if (Object.keys(data.matchPredictions).length > 0) {
        const matchResult = await predictionService.submitBatchMatchBets(
          user.uid,
          selectedPredictorId,
          data.matchPredictions,
          firestoreMatches,
        );
        if (matchResult.errors.length > 0) errors.push(...matchResult.errors);
        successCount += matchResult.successCount;
      }

      if (data.classification.length > 0) {
        const groupResult = await predictionService.submitBatchGroupBets(
          user.uid,
          selectedPredictorId,
          {
            [groupId]: data.classification,
          },
        );
        if (groupResult.errors.length > 0) errors.push(...groupResult.errors);
        successCount += groupResult.successCount;
      }

      setSubmitting(false);
      if (successCount > 0) {
        setFeedback({
          type: 'success',
          message: translations.feedback.submittedCount.replace('{count}', String(successCount)),
        });
        setSubmittedSteps((prev) => new Set(prev).add(stepIndex));

        setGroupBetsByGroupId((prev) => ({ ...prev, [groupId]: data.classification }));
        const newMatchBets = new Set(existingMatchBets);
        Object.keys(data.matchPredictions).forEach((id) => newMatchBets.add(id));
        setExistingMatchBets(newMatchBets);
      }
      if (errors.length > 0) setFeedback({ type: 'error', message: errors[0] });
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, firestoreMatches, translations, existingMatchBets],
  );

  const handleKnockoutRoundSubmit = useCallback(
    async (phase: string, stepIndex: number, predictions: Record<string, string>) => {
      if (!user || !selectedPredictorId) return;
      setSubmitting(true);
      setFeedback(null);

      const phaseMatches = firestoreMatches.filter((m) => m.phase === phase);
      const result = await predictionService.submitBatchKnockoutBets(
        user.uid,
        selectedPredictorId,
        predictions,
        phaseMatches,
      );

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

        const newKnockoutBets = { ...knockoutBetsByMatchSlug };
        Object.entries(predictions).forEach(([slug, winner]) => {
          newKnockoutBets[slug] = winner;
        });
        setKnockoutBetsByMatchSlug(newKnockoutBets);
      }
      if (result.errors.length > 0) setFeedback({ type: 'error', message: result.errors[0] });
      setTimeout(() => setFeedback(null), 5000);
    },
    [user, selectedPredictorId, firestoreMatches, translations, knockoutBetsByMatchSlug],
  );

  const steps = useMemo(() => {
    const result: PredictionStepModel[] = [];
    let stepIndex = 0;

    for (const group of groups) {
      const groupMatches = firestoreMatches.filter(
        (m) => m.phase === 'group' && m.groupId === group.slug,
      );
      const existingGroupBet = groupBetsByGroupId[group.slug] || null;
      const groupMatchBetIds = new Set(
        groupMatches.filter((m) => existingMatchBets.has(m.id)).map((m) => m.id),
      );

      const isGroupComplete =
        existingGroupBet != null &&
        isGroupClassificationComplete(existingGroupBet, group.teams.length);

      const canAdvanceGroup =
        submittedSteps.has(stepIndex) || isGroupComplete || existingGroupBet != null;

      const stepDescription =
        translations.stepDescriptionGroup?.replace('{group}', group.name) ||
        `Predict scores and rank teams for ${group.name}`;

      result.push({
        id: `group-${group.slug}`,
        kind: 'group',
        label: group.name,
        description: stepDescription,
        isComplete: submittedSteps.has(stepIndex) || isGroupComplete,
        canAdvance: canAdvanceGroup,
        deadline,
        content: (
          <PredictionStepGroup
            group={group}
            groupMatches={groupMatches.map((m) => ({ ...m, id: m.slug }))}
            teamsMap={teamsMap}
            existingMatchBets={groupMatchBetIds}
            existingGroupBet={existingGroupBet}
            onSubmit={(data) => handleGroupStepSubmit(group.slug, stepIndex, data)}
            isDisabled={submitting || (deadline != null && deadline < new Date())}
            locale={locale}
          />
        ),
        onSubmit: () => Promise.resolve(),
      });
      stepIndex++;
    }

    for (const phase of KNOCKOUT_PHASES) {
      const phaseMatches = firestoreMatches.filter((m) => m.phase === phase);
      if (phaseMatches.length === 0) continue;

      const phaseSlugSet = new Set(phaseMatches.map((m) => m.slug));
      const existingPhaseBets = new Set(
        Object.keys(knockoutBetsByMatchSlug).filter((slug) => phaseSlugSet.has(slug)),
      );

      const isPhaseComplete =
        existingPhaseBets.size > 0 && phaseMatches.every((m) => existingPhaseBets.has(m.slug));

      const allPicksMade = phaseMatches.every((m) => knockoutBetsByMatchSlug[m.slug]);

      const canAdvanceKnockout = submittedSteps.has(stepIndex) || isPhaseComplete || allPicksMade;

      const roundLabel = KNOCKOUT_PHASE_LABELS[phase]?.toLowerCase() || phase;
      const stepDescription =
        translations.stepDescriptionRound?.replace('{round}', roundLabel) ||
        `Pick winners for the ${roundLabel}`;

      const thirdPlaceTeams: ThirdPlacedTeam[] =
        phase === 'round-of-32'
          ? computeThirdPlaceStandings(groupBetsByGroupId, {}, firestoreMatches, teamsMap, groups)
          : [];

      result.push({
        id: `knockout-${phase}`,
        kind: 'knockout-round',
        label: KNOCKOUT_PHASE_LABELS[phase] || phase,
        description: stepDescription,
        isComplete: submittedSteps.has(stepIndex) || isPhaseComplete,
        canAdvance: canAdvanceKnockout,
        deadline,
        content: (
          <PredictionStepKnockoutRound
            phase={phase}
            roundMatches={phaseMatches.map((m) => ({
              slug: m.slug,
              phase: m.phase,
              homeTeam: m.homeTeamId
                ? { fifaCode: m.homeTeamId.toUpperCase(), name: m.homeTeamId }
                : null,
              awayTeam: m.awayTeamId
                ? { fifaCode: m.awayTeamId.toUpperCase(), name: m.awayTeamId }
                : null,
              predictionDeadline: m.predictionDeadline.toDate(),
            }))}
            groupBetsByGroupId={groupBetsByGroupId}
            existingKnockoutBets={existingPhaseBets}
            previousRoundPredictions={knockoutBetsByMatchSlug}
            onSubmit={(predictions) => handleKnockoutRoundSubmit(phase, stepIndex, predictions)}
            isDisabled={submitting || (deadline != null && deadline < new Date())}
            thirdPlaceTeams={thirdPlaceTeams}
          />
        ),
        onSubmit: () => Promise.resolve(),
      });
      stepIndex++;
    }

    result.push({
      id: 'final-positions',
      kind: 'final-positions',
      label: translations.stepFinalPhase,
      description: translations.stepFinalPhaseDesc,
      isComplete: submittedSteps.has(stepIndex) || existingFinalPhase != null,
      canAdvance: true,
      deadline,
      content: (
        <PredictionStepFinalPhase
          teams={allTeams}
          existingPrediction={existingFinalPhase || undefined}
          onSubmit={handleFinalPhaseSubmit}
          isDisabled={submitting || (deadline != null && deadline < new Date())}
          locale={locale}
        />
      ),
      onSubmit: () => Promise.resolve(),
    });
    stepIndex++;

    result.push({
      id: 'best-players',
      kind: 'best-players',
      label: translations.stepBestPlayers,
      description: translations.stepBestPlayersDesc,
      isComplete: submittedSteps.has(stepIndex) || existingBestPlayers != null,
      canAdvance: true,
      deadline,
      content: (
        <PredictionStepBestPlayers
          existingPrediction={existingBestPlayers || undefined}
          onSubmit={handleBestPlayersSubmit}
          isDisabled={submitting || (deadline != null && deadline < new Date())}
        />
      ),
      onSubmit: () => Promise.resolve(),
    });

    return result;
  }, [
    translations,
    submittedSteps,
    teamsMap,
    submitting,
    locale,
    groups,
    firestoreMatches,
    existingMatchBets,
    groupBetsByGroupId,
    knockoutBetsByMatchSlug,
    allTeams,
    existingFinalPhase,
    existingBestPlayers,
    handleFinalPhaseSubmit,
    handleBestPlayersSubmit,
    handleGroupStepSubmit,
    handleKnockoutRoundSubmit,
    deadline,
  ]);

  const canAdvance = steps[currentStep]?.canAdvance ?? true;

  const thirdPlaceTeams = useMemo(
    () => computeThirdPlaceStandings(groupBetsByGroupId, {}, firestoreMatches, teamsMap, groups),
    [groupBetsByGroupId, firestoreMatches, teamsMap, groups],
  );

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
    allTeams,
    teamsMap,
    groups,
    firestoreMatches,
    thirdPlaceTeams,
  };
}
