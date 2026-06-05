import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Match } from '@app-types/firestore';
import type { ThirdPlacedTeam } from '@app-types/prediction-steps';
import { PredictionStepGroup, type PredictionStepGroupProps } from '@molecules/Predictions';
import {
  PredictionStepKnockoutRound,
  type PredictionStepKnockoutRoundProps,
} from '@molecules/Predictions';
import {
  PredictionStepBestPlayers,
  type PredictionStepBestPlayersProps,
  PredictionStepFinalPhase,
  type PredictionStepFinalPhaseProps,
  ThirdPlaceConfirmation,
  type ThirdPlaceConfirmationProps,
} from '@molecules/Predictions';
import type { GroupForPrediction } from '@organisms/GroupPredictionForm';
import { getLocalizedName } from '@utils/i18n';

type GroupStepTranslations = PredictionStepGroupProps['translations'];
type KnockoutStepTranslations = PredictionStepKnockoutRoundProps['translations'];
type FinalPhaseStepTranslations = PredictionStepFinalPhaseProps['translations'];
type BestPlayersStepTranslations = PredictionStepBestPlayersProps['translations'];
type ThirdPlaceStepTranslations = ThirdPlaceConfirmationProps['translations'];
import { predictionService } from '@services/prediction-service';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import {
  buildKnockoutBracket,
  computeThirdPlaceStandings,
  deriveFinalFour,
  isGroupClassificationComplete,
  isGroupMatchesComplete,
  KNOCKOUT_PHASES,
} from '@utils/predictions-flow';

import type { PredictionStepModel, PredictionStepState } from '../types/prediction-steps';

const KNOCKOUT_PHASE_LABELS: Record<string, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  'third-place': 'Third Place',
  final: 'Final',
};

function mapErrorToMessage(
  error: string,
  translations: { captchaError: string; feedback: { submitFailed: string } },
): string {
  if (error === 'CAPTCHA_ERROR') {
    return translations.captchaError;
  }
  return translations.feedback.submitFailed;
}

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
  /** Runs the current step's registered submit (saves whatever is entered). */
  submitCurrentStep: () => Promise<void>;
  allTeams: { fifaCode: string; name: string }[];
  teamsMap: Record<string, { fifaCode: string; name: string }>;
  groups: GroupForPrediction[];
  firestoreMatches: (Match & { id: string })[];
  thirdPlaceTeams: ThirdPlacedTeam[];
  betsStatus: 'loading' | 'error' | 'loaded';
  retryBets: () => void;
}

export function usePredictionSteps(
  translations: {
    stepFinalPhase: string;
    stepFinalPhaseDesc: string;
    stepBestPlayers: string;
    stepBestPlayersDesc: string;
    stepDescriptionGroup?: string;
    stepDescriptionRound?: string;
    captchaError: string;
    feedback: {
      submittedCount: string;
      finalPhaseSubmitted: string;
      bestPlayersSubmitted: string;
      submitFailed: string;
    };
    groupStep?: GroupStepTranslations;
    knockoutStep?: KnockoutStepTranslations;
    finalPhaseStep?: FinalPhaseStepTranslations;
    bestPlayersStep?: BestPlayersStepTranslations;
    thirdPlaceStep?: ThirdPlaceStepTranslations;
    thirdPlaceHeading?: string;
    thirdPlaceSubtitle?: string;
    thirdPlaceAdvancing?: string;
    thirdPlaceEliminated?: string;
    thirdPlaceBracketSlotLabel?: string;
    thirdPlaceAdjust?: string;
    thirdPlaceContinue?: string;
    thirdPlaceGroup?: string;
    thirdPlacePts?: string;
    thirdPlacePt?: string;
    thirdPlaceSelectionCount?: string;
    thirdPlaceToggleAdvancing?: string;
    thirdPlaceToggleEliminated?: string;
    thirdPlaceMaxSelected?: string;
    thirdPlaceLoading?: string;
    thirdPlaceError?: string;
    thirdPlaceRetry?: string;
  },
  locale: 'en' | 'es',
  selectedPredictorId: string | null,
  deadline: Date | undefined = undefined,
  confirmedAdvancingMap?: Record<string, string>,
  confirmedThirdPlace?: boolean,
  onThirdPlaceAdjust?: () => void,
  onThirdPlaceContinue?: (confirmedSlugs: string[]) => void,
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
  // Saved match scores keyed by match id; predictions stay editable and prefilled
  // from these until the deadline, so we keep the values (not just the ids).
  const [existingMatchValues, setExistingMatchValues] = useState<
    Record<string, { home: number; away: number }>
  >({});

  // A single "Next" button drives each step: steps register their submit handler
  // (in a ref, no re-render) and report whether the user may advance.
  const stepSubmitRef = useRef<Record<number, () => Promise<void>>>({});
  const [stepCanAdvance, setStepCanAdvance] = useState<Record<number, boolean>>({});

  const registerStepState = useCallback(
    (idx: number) => (state: PredictionStepState) => {
      stepSubmitRef.current[idx] = state.submit;
      setStepCanAdvance((prev) =>
        prev[idx] === state.canAdvance ? prev : { ...prev, [idx]: state.canAdvance },
      );
    },
    [],
  );
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

  const [betsStatus, setBetsStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const retryBets = useCallback(() => {
    setBetsStatus('loading');
    setFetchTrigger((n) => n + 1);
  }, []);

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
            const resolvedName = getLocalizedName(x.name, locale);
            tMap[x.fifaCode.toLowerCase()] = { fifaCode: x.fifaCode, name: resolvedName };
            tMap[x.fifaCode] = { fifaCode: x.fifaCode, name: resolvedName };
            teamsList.push({ fifaCode: x.fifaCode, name: resolvedName });
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
                  .map((x) => ({
                    fifaCode: x.fifaCode,
                    name: getLocalizedName(x.name, locale),
                  })),
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
    setBetsStatus('loading');
    if (!user || !selectedPredictorId) {
      setBetsStatus('loaded');
      return;
    }
    let cancelled = false;
    predictionService
      .getExistingBets(user.uid, selectedPredictorId)
      .then(({ matchBets, groupBets, finalPhase, bestPlayers, knockoutBets }) => {
        if (cancelled) return;
        setExistingMatchValues(Object.fromEntries(matchBets));

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
        setBetsStatus('loaded');
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[usePredictionSteps] getExistingBets failed:', err);
        setBetsStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId, fetchTrigger]);

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
            message: result.error
              ? mapErrorToMessage(result.error, translations)
              : translations.feedback.submitFailed,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: translations.feedback.submitFailed,
        });
      }
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3000);
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
            message: result.error
              ? mapErrorToMessage(result.error, translations)
              : translations.feedback.submitFailed,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: translations.feedback.submitFailed,
        });
      }
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3000);
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
        setExistingMatchValues((prev) => ({ ...prev, ...data.matchPredictions }));
      }
      if (errors.length > 0) {
        const error = errors[0];
        setFeedback({
          type: 'error',
          message: error === 'CAPTCHA_ERROR' ? translations.captchaError : error,
        });
      }
      setTimeout(() => setFeedback(null), 3000);
    },
    [user, selectedPredictorId, firestoreMatches, translations],
  );

  // Streams individual winner picks to livePredictions + knockoutBetsByMatchSlug in real-time,
  // so buildKnockoutBracket recomputes with updated picks before the round is submitted.
  const handlePredictionStreaming = useCallback((matchSlug: string, winnerFifaCode: string) => {
    setKnockoutBetsByMatchSlug((prev) => ({ ...prev, [matchSlug]: winnerFifaCode }));
  }, []);

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

        setKnockoutBetsByMatchSlug((prev) => ({ ...prev, ...predictions }));
      }
      if (result.errors.length > 0) {
        const error = result.errors[0];
        setFeedback({
          type: 'error',
          message: error === 'CAPTCHA_ERROR' ? translations.captchaError : error,
        });
      }
      setTimeout(() => setFeedback(null), 3000);
    },
    [user, selectedPredictorId, firestoreMatches, translations],
  );

  const thirdPlaceTeams = useMemo(
    () =>
      computeThirdPlaceStandings(
        groupBetsByGroupId,
        existingMatchValues,
        firestoreMatches,
        teamsMap,
        groups,
        confirmedAdvancingMap ? Object.keys(confirmedAdvancingMap) : undefined,
      ),
    // Recompute when betsStatus transitions from 'loading' → 'loaded', ensuring
    // existingMatchValues is fully populated from Firestore before computing third-place standings.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: trigger recompute on data load
    [
      groupBetsByGroupId,
      existingMatchValues,
      firestoreMatches,
      teamsMap,
      groups,
      confirmedAdvancingMap,
      betsStatus,
    ],
  );

  const steps = useMemo(() => {
    const result: PredictionStepModel[] = [];
    let stepIndex = 0;

    for (const group of groups) {
      const idx = stepIndex;
      const groupMatches = firestoreMatches.filter(
        (m) => m.phase === 'group' && m.groupId === group.slug,
      );
      // Use the same `id = slug` shape rendered below so `m.id` keys line up with
      // `existingMatchValues` (which is keyed by match slug).
      const groupMatchesWithId = groupMatches.map((m) => ({ ...m, id: m.slug }));
      const existingGroupBet = groupBetsByGroupId[group.slug] || null;

      // A group only counts complete once its match scores are persisted too — not on
      // classification alone. Without this, the third-place screen is reachable with empty
      // scores, which collapses every third-place team to 0 pts → alphabetical A-H.
      const hasAllMatchScores = isGroupMatchesComplete(
        groupMatchesWithId,
        existingMatchValues,
        group.slug,
      );

      const isGroupComplete =
        existingGroupBet != null &&
        isGroupClassificationComplete(existingGroupBet, group.teams.length) &&
        hasAllMatchScores;

      const canAdvanceGroup = submittedSteps.has(stepIndex) || isGroupComplete;

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
            // Remount when the predictor or group changes so the step re-seeds from that
            // predictor's freshly loaded saved scores. Within a predictor it stays mounted,
            // so in-progress edits survive prop updates (no more clobbering on submit/reload).
            key={`${selectedPredictorId ?? 'none'}-${group.slug}`}
            group={group}
            groupMatches={groupMatchesWithId}
            teamsMap={teamsMap}
            existingMatchValues={existingMatchValues}
            existingGroupBet={existingGroupBet}
            onSubmit={(data) => handleGroupStepSubmit(group.slug, idx, data)}
            isDisabled={submitting || (deadline != null && deadline < new Date())}
            locale={locale}
            onStateChange={registerStepState(idx)}
            translations={translations.groupStep}
          />
        ),
        onSubmit: () => Promise.resolve(),
      });
      stepIndex++;
    }

    // Third-place confirmation step
    result.push({
      id: 'third-place',
      kind: 'third-place',
      label: 'Third Place',
      description: translations.stepDescriptionRound?.replace('{round}', 'third place') || 'Confirm which third-placed teams advance',
      isComplete: confirmedThirdPlace ?? false,
      canAdvance: true,
      deadline,
      content: (
        <ThirdPlaceConfirmation
          rankedTeams={thirdPlaceTeams}
          onAdjust={onThirdPlaceAdjust || (() => {})}
          onContinue={onThirdPlaceContinue || (() => {})}
          isLoading={betsStatus === 'loading'}
          hasError={betsStatus === 'error'}
          onRetry={retryBets}
          translations={{
            heading: translations.thirdPlaceHeading || 'Third-Placed Teams Qualification',
            subtitle: translations.thirdPlaceSubtitle || 'Best 8 of 12 third-placed teams advance to Round of 32',
            advancing: translations.thirdPlaceAdvancing || 'Advancing to Round of 32',
            eliminated: translations.thirdPlaceEliminated || 'Eliminated',
            bracketSlot: translations.thirdPlaceBracketSlotLabel || 'Match',
            adjust: translations.thirdPlaceAdjust || 'Adjust Group Predictions',
            continue: translations.thirdPlaceContinue || 'Continue to Knockout',
            group: translations.thirdPlaceGroup || 'Group',
            pts: translations.thirdPlacePts || 'pts',
            pt: translations.thirdPlacePt || 'pt',
            selectionCount: translations.thirdPlaceSelectionCount,
            toggleAdvancing: translations.thirdPlaceToggleAdvancing,
            toggleEliminated: translations.thirdPlaceToggleEliminated,
            maxSelected: translations.thirdPlaceMaxSelected,
            loading: translations.thirdPlaceLoading,
            error: translations.thirdPlaceError,
            retry: translations.thirdPlaceRetry,
          }}
        />
      ),
      onSubmit: () => Promise.resolve(),
    });
    stepIndex++;

    const knockoutMatchesList = firestoreMatches.filter((m) =>
      (KNOCKOUT_PHASES as string[]).includes(m.phase),
    );
    const resolvedBracket = buildKnockoutBracket(
      groupBetsByGroupId,
      knockoutMatchesList,
      knockoutBetsByMatchSlug,
      confirmedAdvancingMap,
    );

    for (const phase of KNOCKOUT_PHASES) {
      const phaseMatches = firestoreMatches.filter((m) => m.phase === phase);
      if (phaseMatches.length === 0) continue;
      const idx = stepIndex;

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

      const phaseResolved = resolvedBracket.filter((m) => m.phase === phase);
      const roundMatches = phaseResolved.map((m) => ({
        slug: m.slug,
        phase: m.phase,
        homeTeam:
          (m as unknown as { homeTeam: { resolvedTeam: string } }).homeTeam.resolvedTeam !== 'TBD'
            ? {
                fifaCode: (m as unknown as { homeTeam: { resolvedTeam: string } }).homeTeam
                  .resolvedTeam,
                name:
                  teamsMap[
                    (m as unknown as { homeTeam: { resolvedTeam: string } }).homeTeam.resolvedTeam
                  ]?.name ||
                  (m as unknown as { homeTeam: { resolvedTeam: string } }).homeTeam.resolvedTeam,
              }
            : null,
        awayTeam:
          (m as unknown as { awayTeam: { resolvedTeam: string } }).awayTeam.resolvedTeam !== 'TBD'
            ? {
                fifaCode: (m as unknown as { awayTeam: { resolvedTeam: string } }).awayTeam
                  .resolvedTeam,
                name:
                  teamsMap[
                    (m as unknown as { awayTeam: { resolvedTeam: string } }).awayTeam.resolvedTeam
                  ]?.name ||
                  (m as unknown as { awayTeam: { resolvedTeam: string } }).awayTeam.resolvedTeam,
              }
            : null,
        tbdHome:
          (m as unknown as { homeTeam: { resolvedTeam: string } }).homeTeam.resolvedTeam === 'TBD'
            ? ('TBD' as const)
            : undefined,
        tbdAway:
          (m as unknown as { awayTeam: { resolvedTeam: string } }).awayTeam.resolvedTeam === 'TBD'
            ? ('TBD' as const)
            : undefined,
        predictionDeadline:
          firestoreMatches.find((fm) => fm.slug === m.slug)?.predictionDeadline.toDate() ??
          new Date(0),
      }));

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
            roundMatches={roundMatches}
            existingKnockoutBets={existingPhaseBets}
            previousRoundPredictions={knockoutBetsByMatchSlug}
            onSubmit={(predictions) => handleKnockoutRoundSubmit(phase, idx, predictions)}
            isDisabled={submitting || (deadline != null && deadline < new Date())}
            onPredictionChange={handlePredictionStreaming}
            onStateChange={registerStepState(idx)}
            translations={translations.knockoutStep}
          />
        ),
        onSubmit: () => Promise.resolve(),
      });
      stepIndex++;
    }

    const finalIdx = stepIndex;

    // Prefill final-four selects from predicted bracket results (saved bet wins)
    const derivedPrefill = (() => {
      if (existingFinalPhase != null) return null;
      const result = deriveFinalFour(knockoutBetsByMatchSlug, groupBetsByGroupId);
      if (
        result.first === 'TBD' &&
        result.second === 'TBD' &&
        result.third === 'TBD' &&
        result.fourth === 'TBD'
      )
        return null;
      return result;
    })();

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
          derivedPrefill={derivedPrefill || undefined}
          onSubmit={handleFinalPhaseSubmit}
          isDisabled={submitting || (deadline != null && deadline < new Date())}
          isSubmitting={submitting}
          locale={locale}
          onStateChange={registerStepState(finalIdx)}
          translations={translations.finalPhaseStep}
        />
      ),
      onSubmit: () => Promise.resolve(),
    });
    stepIndex++;

    const bestIdx = stepIndex;
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
          isSubmitting={submitting}
          onStateChange={registerStepState(bestIdx)}
          translations={translations.bestPlayersStep}
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
    existingMatchValues,
    groupBetsByGroupId,
    knockoutBetsByMatchSlug,
    allTeams,
    existingFinalPhase,
    existingBestPlayers,
    handleFinalPhaseSubmit,
    handleBestPlayersSubmit,
    handleGroupStepSubmit,
    handleKnockoutRoundSubmit,
    handlePredictionStreaming,
    registerStepState,
    deadline,
    confirmedAdvancingMap,
    confirmedThirdPlace,
    onThirdPlaceAdjust,
    onThirdPlaceContinue,
    thirdPlaceTeams,
    betsStatus,
    retryBets,
    selectedPredictorId,
  ]);

  // Allow advancing when either the saved data already satisfies the step
  // (model fallback) or the live form reports it is ready to submit.
  const canAdvance =
    (steps[currentStep]?.canAdvance ?? false) || (stepCanAdvance[currentStep] ?? false);

  // Stable dispatcher for the wizard's single Next button: persists the current
  // step using the handler each step registered via onStateChange.
  const submitCurrentStep = useCallback(async () => {
    await stepSubmitRef.current[currentStep]?.();
  }, [currentStep]);

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
    submitCurrentStep,
    allTeams,
    teamsMap,
    groups,
    firestoreMatches,
    thirdPlaceTeams,
    betsStatus,
    retryBets,
  };
}
