import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AvatarOptions, Predictor } from '@app-types/firestore';
import type { DeadlineInfo } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { usePredictionSteps } from '@hooks/usePredictionSteps';
import {
  PredictionsNavigation,
  PredictionsProgress,
  type PredictionStepBestPlayersProps,
  type PredictionStepFinalPhaseProps,
  type PredictionStepGroupProps,
  type PredictionStepKnockoutRoundProps,
  ThirdPlaceConfirmation,
} from '@molecules/Predictions';
import { PredictorDeleteConfirm } from '@molecules/PredictorDeleteConfirm';
import { PredictorEditor } from '@molecules/PredictorEditor';
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList';
import { predictorService } from '@services/predictor-service';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import { useToastStore } from '@store/toast-store';
import { getLoginRoute } from '@utils/i18n';

import './PredictionsTemplate.css';

type PredictorView = 'list' | 'wizard' | 'editor' | 'delete';

type GroupStepTranslations = PredictionStepGroupProps['translations'];
type KnockoutStepTranslations = PredictionStepKnockoutRoundProps['translations'];
type FinalPhaseStepTranslations = PredictionStepFinalPhaseProps['translations'];
type BestPlayersStepTranslations = PredictionStepBestPlayersProps['translations'];

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

export interface PredictionsTemplateProps {
  translations: {
    title: string;
    noMatches: string;
    submitSuccess: string;
    submitError: string;
    captchaError: string;
    loginRequired: string;
    loginButton: string;
    loading: string;
    stepFinalPhase: string;
    stepFinalPhaseDesc: string;
    stepBestPlayers: string;
    stepBestPlayersDesc: string;
    buttonNext: string;
    buttonBack: string;
    buttonSubmit?: string;
    buttonFinish?: string;
    stepXofY: string;
    stepsNavLabel?: string;
    stepTooltipEdit?: string;
    stepTooltipCompleted?: string;
    submitToAdvance?: string;
    stepDescriptionGroup?: string;
    stepDescriptionRound?: string;
    thirdPlaceHeading?: string;
    thirdPlaceSubtitle?: string;
    deadlinePassed?: string;
    deadlineCountdown?: string;
    predictedStandings: string;
    team: string;
    pts: string;
    feedbackSuccessTitle?: string;
    feedbackErrorTitle?: string;
    feedback: {
      submittedCount: string;
      finalPhaseSubmitted: string;
      bestPlayersSubmitted: string;
      submitFailed: string;
    };
    predictor: {
      title: string;
      select: string;
      create: string;
      createButton: string;
      namePlaceholder: string;
      loading: string;
      noPredictors: string;
      getStarted: string;
    };
    predictorList?: {
      newButton?: string;
      progress?: string;
      points?: string;
      edit?: string;
      delete?: string;
      empty?: string;
      backToPredictors?: string;
      listLabel?: string;
      editPredictionsAria?: string;
      editProfileAria?: string;
      deleteAria?: string;
      editProfile?: string;
    };
    predictorEditor?: {
      favouriteTeamLabel?: string;
      noFavouriteTeam?: string;
      createTitle?: string;
      editTitle?: string;
      nameLabel?: string;
      namePlaceholder?: string;
      save?: string;
      cancel?: string;
      nameRequired?: string;
      skinLabel?: string;
      hairLabel?: string;
      hairColorLabel?: string;
      clothingLabel?: string;
      clothingColorLabel?: string;
      glassesLabel?: string;
      glassesNone?: string;
      randomize?: string;
      randomizeAria?: string;
      swatchColorAria?: string;
      swatchStyleAria?: string;
    };
    predictorDelete?: {
      title?: string;
      confirmText?: string;
      typeName?: string;
      placeholder?: string;
      confirmButton?: string;
      cancelButton?: string;
    };
    thirdPlaceAdvancing?: string;
    thirdPlaceEliminated?: string;
    thirdPlaceBracketSlotLabel?: string;
    thirdPlaceContinue?: string;
    thirdPlaceAdjust?: string;
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
    groupStep?: GroupStepTranslations;
    knockoutStep?: KnockoutStepTranslations;
    finalPhaseStep?: FinalPhaseStepTranslations;
    bestPlayersStep?: BestPlayersStepTranslations;
  };
  locale?: 'en' | 'es';
  className?: string;
}

const defaultListTranslations = {
  newButton: 'New prediction',
  progress: 'groups',
  points: 'pts',
  edit: 'Edit',
  delete: 'Delete',
  empty: 'No predictions yet',
  backToPredictors: 'Back to predictions',
  listLabel: 'Predictor list',
  editPredictionsAria: 'Edit predictions for {name}',
  editProfileAria: 'Edit name and avatar for {name}',
  deleteAria: 'Delete {name}',
  editProfile: 'Edit Profile',
};

export const PredictionsTemplate: FC<PredictionsTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [selectedPredictorId, setSelectedPredictorId] = useState<string | null>(null);
  const [predictorsLoading, setPredictorsLoading] = useState(!!user);
  const [predictorEntries, setPredictorEntries] = useState<PredictorListEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [view, setView] = useState<PredictorView>('list');
  const [editingPredictor, setEditingPredictor] = useState<Predictor | null>(null);
  const [deletingPredictor, setDeletingPredictor] = useState<Predictor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tournament deadline state
  const [tournamentDeadline, setTournamentDeadline] = useState<Date | undefined>(undefined);
  const [deadlineLoading, setDeadlineLoading] = useState(true);

  useEffect(() => {
    tournamentService
      .getTournament()
      .then((t) => setTournamentDeadline(t?.deadline?.toDate() ?? undefined))
      .catch(() => {})
      .finally(() => setDeadlineLoading(false));
  }, []);

  // Deadline countdown — refresh every 60s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const deadlineInfo: DeadlineInfo | undefined = useMemo(() => {
    if (!tournamentDeadline) return undefined;
    const diff = tournamentDeadline.getTime() - now;
    const state = diff <= 0 ? 'passed' : 'before';
    const label =
      (state === 'passed' ? translations.deadlinePassed : translations.deadlineCountdown) ||
      'Deadline';
    const countdownLabel =
      state === 'before' && diff > 0
        ? (translations.deadlineCountdown || '{time}').replace('{time}', formatDuration(diff))
        : undefined;
    return { deadline: tournamentDeadline, state, label, countdownLabel };
  }, [tournamentDeadline, now, translations.deadlinePassed, translations.deadlineCountdown]);

  const [showThirdPlaceConfirm, setShowThirdPlaceConfirm] = useState(false);
  const [confirmedThirdPlace, setConfirmedThirdPlace] = useState(false);
  const [confirmedAdvancingMap, setConfirmedAdvancingMap] = useState<
    Record<string, string> | undefined
  >(undefined);

  const {
    loading: stepsLoading,
    steps,
    currentStep,
    setCurrentStep,
    submittedSteps,
    feedback,
    totalSteps,
    canAdvance,
    submitCurrentStep,
    submitting,
    thirdPlaceTeams,
    groups,
    allTeams,
    betsStatus,
    retryBets,
  } = usePredictionSteps(
    {
      ...translations,
      groupStep: translations.groupStep,
      knockoutStep: translations.knockoutStep,
      finalPhaseStep: translations.finalPhaseStep,
      bestPlayersStep: translations.bestPlayersStep,
    },
    locale,
    selectedPredictorId,
    tournamentDeadline,
    confirmedAdvancingMap,
  );

  const groupsCount = groups.length;

  // Show feedback as toast instead of inline banner to avoid layout shift
  useEffect(() => {
    if (!feedback) return;
    const id = `pred-feedback-${Date.now()}`;
    useToastStore.getState().addToast({
      type: feedback.type,
      title:
        feedback.type === 'success'
          ? translations.feedbackSuccessTitle || 'Saved'
          : translations.feedbackErrorTitle || 'Error',
      message: feedback.message,
    });
    const timer = setTimeout(() => {
      useToastStore.getState().dismissToast(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback, translations.feedbackSuccessTitle, translations.feedbackErrorTitle]);

  useEffect(() => {
    if (confirmedThirdPlace) {
      setConfirmedThirdPlace(false);
      return;
    }
    const lastGroupStep = groupsCount - 1;
    if (
      currentStep === lastGroupStep &&
      !showThirdPlaceConfirm &&
      steps[lastGroupStep]?.isComplete &&
      betsStatus === 'loaded'
    ) {
      setShowThirdPlaceConfirm(true);
    }
  }, [currentStep, groupsCount, showThirdPlaceConfirm, confirmedThirdPlace, steps, betsStatus]);

  const handleThirdPlaceAdjust = () => {
    setShowThirdPlaceConfirm(false);
    // Editing group standings can change which thirds rank — drop the confirmed
    // advancing set so the bracket falls back to the deterministic default until
    // the user re-confirms, rather than resolving from a now-stale selection.
    setConfirmedAdvancingMap(undefined);
    const firstGroupIdx = steps.findIndex((s) => s.kind === 'group');
    if (firstGroupIdx >= 0) {
      setCurrentStep(firstGroupIdx);
    }
  };

  const handleThirdPlaceContinue = (confirmedSlugs: string[]) => {
    setShowThirdPlaceConfirm(false);
    setConfirmedThirdPlace(true);
    const map: Record<string, string> = {};
    confirmedSlugs.forEach((slug) => {
      const team = thirdPlaceTeams.find((t) => `group-${t.groupLetter.toLowerCase()}` === slug);
      if (team) map[slug] = team.teamId;
    });
    setConfirmedAdvancingMap(map);
    setCurrentStep(groupsCount);
  };

  useEffect(() => {
    if (!feedback) return;
    useToastStore.getState().addToast({
      type: feedback.type,
      title:
        feedback.type === 'success'
          ? translations.feedbackSuccessTitle || 'Saved'
          : translations.feedbackErrorTitle || 'Error',
      message: feedback.message,
    });
    const timer = setTimeout(() => useToastStore.getState().dismissToast, 5000);
    return () => clearTimeout(timer);
  }, [feedback, translations.feedbackSuccessTitle, translations.feedbackErrorTitle]);

  useEffect(() => {
    if (!user) {
      setPredictorsLoading(false);
      setEntriesLoading(false);
      return;
    }
    let cancelled = false;
    setPredictorsLoading(true);
    predictorService
      .getUserPredictors(user.uid)
      .then((p) => {
        if (cancelled) return;
        setPredictors(p);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPredictorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loadPredictorEntries = useCallback(async () => {
    if (!user) return;
    setEntriesLoading(true);
    try {
      const results = await predictorService.getUserPredictorsWithStats(user.uid);
      const entries: PredictorListEntry[] = results.map((r) => ({
        predictor: r,
        points: r.stats?.totalPoints,
        groupsDone: r.progress.groupsSubmitted,
        groupsTotal: r.progress.totalGroups,
        badgesAwarded: r.stats?.badgesAwarded,
      }));
      setPredictorEntries(entries);
    } catch {
      setPredictorEntries(predictors.map((p) => ({ predictor: p })));
    } finally {
      setEntriesLoading(false);
    }
  }, [user, predictors]);

  useEffect(() => {
    let cancelled = false;
    loadPredictorEntries().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadPredictorEntries]);

  const handleSelectPredictor = (predictorId: string) => {
    setSelectedPredictorId(predictorId);
    setView('wizard');
  };

  const handleCreatePredictor = async (data: {
    name: string;
    pixelArt: { seed: string; options: AvatarOptions };
    favouriteTeamId?: string;
  }) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const np = await predictorService.createPredictor(
        user.uid,
        data.name,
        undefined,
        data.favouriteTeamId,
        data.pixelArt,
      );
      setPredictors((prev) => [
        ...prev,
        { ...np, pixelArt: data.pixelArt, favouriteTeamId: data.favouriteTeamId },
      ]);
      await loadPredictorEntries();
      setView('list');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[PredictionsTemplate] createPredictor failed', err);
      useToastStore.getState().addToast({
        title: translations.submitError,
        message: translations.submitError,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePredictor = async (data: {
    name: string;
    pixelArt: { seed: string; options: AvatarOptions };
    favouriteTeamId?: string;
  }) => {
    if (!user || !editingPredictor) return;
    setIsSubmitting(true);
    try {
      await predictorService.updatePredictor(user.uid, editingPredictor.id, {
        name: data.name,
        pixelArt: data.pixelArt,
        favouriteTeamId: data.favouriteTeamId || null,
      });
      setPredictors((prev) =>
        prev.map((p) =>
          p.id === editingPredictor.id
            ? {
                ...p,
                name: data.name,
                pixelArt: data.pixelArt,
                favouriteTeamId: data.favouriteTeamId,
              }
            : p,
        ),
      );
      await loadPredictorEntries();
      setView('list');
      setEditingPredictor(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[PredictionsTemplate] updatePredictor failed', err);
      useToastStore.getState().addToast({
        title: translations.submitError,
        message: translations.submitError,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePredictor = async () => {
    if (!user || !deletingPredictor) return;
    setIsSubmitting(true);
    try {
      await predictorService.deletePredictor(user.uid, deletingPredictor.id);
      setPredictors((prev) => prev.filter((p) => p.id !== deletingPredictor.id));
      if (selectedPredictorId === deletingPredictor.id) {
        setSelectedPredictorId(null);
      }
      await loadPredictorEntries();
      setView('list');
      setDeletingPredictor(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    loadPredictorEntries();
  };

  const loading = stepsLoading || isAuthLoading || predictorsLoading || deadlineLoading;

  if (loading) {
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
          <Button href={getLoginRoute(locale)} variant="primary">
            <Icon name="login" size={18} /> {translations.loginButton}
          </Button>
        </div>
      </div>
    );
  }

  const stripUndefined = <T extends Record<string, unknown>>(obj?: T): Partial<T> => {
    if (!obj) return {};
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
  };

  const listTranslations = {
    ...defaultListTranslations,
    ...stripUndefined(translations.predictorList),
  };

  const editorTranslations = {
    favouriteTeamLabel: 'Favorite Team',
    noFavouriteTeam: 'No favorite',
    ...stripUndefined(translations.predictorEditor),
  };

  const deleteTranslations = stripUndefined(translations.predictorDelete);

  if (view === 'list') {
    return (
      <div className={`predictions-template ${className}`}>
        <main className="predictions-template__content">
          <header className="predictions-template__header">
            <Typography variant="h1">{translations.title}</Typography>
          </header>

          {entriesLoading ? (
            <div className="predictions-template__loading">
              <Spinner size="lg" />
              <Typography variant="body">{translations.loading}</Typography>
            </div>
          ) : (
            <PredictorList
              predictors={predictorEntries}
              onSelect={handleSelectPredictor}
              onEdit={(id) => {
                const p = predictors.find((x) => x.id === id);
                if (p) {
                  setEditingPredictor(p);
                  setView('editor');
                }
              }}
              onDelete={(id) => {
                const p = predictors.find((x) => x.id === id);
                if (p) {
                  setDeletingPredictor(p);
                  setView('delete');
                }
              }}
              onCreate={() => {
                setEditingPredictor(null);
                setView('editor');
              }}
              locale={locale}
              translations={listTranslations}
            />
          )}
        </main>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className={`predictions-template ${className}`}>
        <main className="predictions-template__content">
          <header className="predictions-template__header">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <Icon name="chevron-left" size={16} /> {listTranslations.backToPredictors}
            </Button>
          </header>

          <PredictorEditor
            mode={editingPredictor ? 'edit' : 'create'}
            predictor={editingPredictor || undefined}
            teams={allTeams}
            onSave={editingPredictor ? handleUpdatePredictor : handleCreatePredictor}
            onCancel={handleBackToList}
            isSubmitting={isSubmitting}
            translations={editorTranslations}
          />
        </main>
      </div>
    );
  }

  if (view === 'delete' && deletingPredictor) {
    return (
      <div className={`predictions-template ${className}`}>
        <main className="predictions-template__content">
          <header className="predictions-template__header">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <Icon name="chevron-left" size={16} /> {listTranslations.backToPredictors}
            </Button>
          </header>

          <PredictorDeleteConfirm
            predictorName={deletingPredictor.name}
            onConfirm={handleDeletePredictor}
            onCancel={handleBackToList}
            isSubmitting={isSubmitting}
            translations={deleteTranslations}
          />
        </main>
      </div>
    );
  }

  const stepCounter = translations.stepXofY
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(totalSteps));

  const activeStep = steps[currentStep];

  return (
    <div className={`predictions-template ${className}`}>
      <main className="predictions-template__content">
        <header className="predictions-template__header">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <Icon name="chevron-left" size={16} /> {listTranslations.backToPredictors}
          </Button>
          <PredictionsProgress stepCounter={stepCounter} deadlineInfo={deadlineInfo} />
        </header>

        {showThirdPlaceConfirm ? (
          <section className="predictions-template__section">
            <ThirdPlaceConfirmation
              rankedTeams={thirdPlaceTeams}
              onAdjust={handleThirdPlaceAdjust}
              onContinue={handleThirdPlaceContinue}
              isLoading={betsStatus === 'loading'}
              hasError={betsStatus === 'error'}
              onRetry={retryBets}
              translations={{
                heading: translations.thirdPlaceHeading || 'Third-Placed Teams Qualification',
                subtitle:
                  translations.thirdPlaceSubtitle ||
                  'Best 8 of 12 third-placed teams advance to Round of 32',
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
          </section>
        ) : (
          <>
            {steps && steps.length > 1 && (
              <nav
                className="predictions-template__steps-nav"
                aria-label={translations.stepsNavLabel || 'Prediction steps'}
              >
                <div className="steps-nav__track">
                  {steps.map((step, idx) => {
                    const isCurrent = idx === currentStep;
                    const isComplete = step.isComplete;
                    const isClickable = isComplete || idx < currentStep;

                    return (
                      <button
                        key={step.id}
                        className={[
                          'steps-nav__step',
                          isCurrent ? 'steps-nav__step--current' : '',
                          isComplete ? 'steps-nav__step--complete' : '',
                          !isClickable ? 'steps-nav__step--locked' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => isClickable && setCurrentStep(idx)}
                        disabled={!isClickable}
                        aria-label={
                          isClickable
                            ? isComplete
                              ? `${step.label} — ${translations.stepTooltipCompleted || 'Completed'}`
                              : `${step.label}`
                            : `${step.label} — ${translations.stepTooltipEdit || 'Not yet completed'}`
                        }
                        title={step.label}
                      >
                        <span className="steps-nav__step-label">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}

            <section className="predictions-template__section">
              <div className="predictions-template__section-header">
                <Typography variant="h2">{activeStep.label}</Typography>
              </div>

              {activeStep.content}
            </section>

            <PredictionsNavigation
              onBack={
                currentStep === 0
                  ? handleBackToList
                  : () => setCurrentStep((p) => Math.max(0, p - 1))
              }
              onNext={async () => {
                // Single button: save the current step, then advance (or finish).
                await submitCurrentStep();
                // Leaving the last group: saving marks it complete and the
                // third-place confirmation effect takes over advancing.
                if (groupsCount > 0 && currentStep === groupsCount - 1) {
                  return;
                }
                if (currentStep < totalSteps - 1) {
                  setCurrentStep((p) => p + 1);
                } else {
                  handleBackToList();
                }
              }}
              canAdvance={canAdvance}
              currentStep={currentStep}
              totalSteps={totalSteps}
              isSubmitting={submitting}
              translations={{
                buttonBack: translations.buttonBack,
                buttonNext: translations.buttonNext,
                buttonFinish: translations.buttonFinish,
                stepsNavLabel: translations.stepsNavLabel,
                stepTooltipEdit: translations.stepTooltipEdit,
                stepTooltipCompleted: translations.stepTooltipCompleted,
              }}
              submittedSteps={submittedSteps}
            />
          </>
        )}
      </main>
    </div>
  );
};
