import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Predictor } from '@app-types/firestore';
import type { DeadlineInfo } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { usePredictionSteps } from '@hooks/usePredictionSteps';
import {
  PredictionsFeedback,
  PredictionsNavigation,
  PredictionsProgress,
  ThirdPlaceConfirmation,
} from '@molecules/Predictions';
import { PredictorDeleteConfirm } from '@molecules/PredictorDeleteConfirm';
import { PredictorEditor } from '@molecules/PredictorEditor';
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList';
import { ProductTour, resetTour } from '@organisms/ProductTour';
import { FIRST_PREDICTOR_TOUR, PREDICTION_WIZARD_TOUR } from '@organisms/ProductTour/tours';
import { predictorService } from '@services/predictor-service';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute } from '@utils/i18n';

import './PredictionsTemplate.css';

type PredictorView = 'list' | 'wizard' | 'editor' | 'delete';

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
    submitToAdvance?: string;
    thirdPlaceHeading?: string;
    thirdPlaceSubtitle?: string;
    deadlinePassed?: string;
    deadlineCountdown?: string;
    predictedStandings: string;
    team: string;
    pts: string;
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
    };
    predictorEditor?: {
      favouriteTeamLabel?: string;
      noFavouriteTeam?: string;
    };
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
  const [showWizardTour, setShowWizardTour] = useState(false);
  const [showFirstTour, setShowFirstTour] = useState(false);

  // Tournament deadline state
  const [tournamentDeadline, setTournamentDeadline] = useState<Date | null>(null);
  const [deadlineLoading, setDeadlineLoading] = useState(true);

  useEffect(() => {
    tournamentService
      .getTournament()
      .then((t) => setTournamentDeadline(t?.deadline?.toDate() || null))
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

  const {
    loading: stepsLoading,
    steps,
    currentStep,
    setCurrentStep,
    submittedSteps,
    feedback,
    totalSteps,
    canAdvance,
    submitting,
    thirdPlaceTeams,
    groups,
    allTeams,
  } = usePredictionSteps(translations, locale, selectedPredictorId, tournamentDeadline);

  const [showThirdPlaceConfirm, setShowThirdPlaceConfirm] = useState(false);
  const [confirmedThirdPlace, setConfirmedThirdPlace] = useState(false);

  const groupsCount = groups.length;

  useEffect(() => {
    if (confirmedThirdPlace) {
      setConfirmedThirdPlace(false);
      return;
    }
    const lastGroupStep = groupsCount - 1;
    if (
      currentStep === lastGroupStep &&
      !showThirdPlaceConfirm &&
      steps[lastGroupStep]?.isComplete
    ) {
      setShowThirdPlaceConfirm(true);
    }
  }, [currentStep, groupsCount, showThirdPlaceConfirm, confirmedThirdPlace, steps]);

  const handleThirdPlaceAdjust = () => {
    setShowThirdPlaceConfirm(false);
    setCurrentStep(groupsCount - 1);
  };

  const handleThirdPlaceContinue = () => {
    setShowThirdPlaceConfirm(false);
    setConfirmedThirdPlace(true);
    setCurrentStep(groupsCount);
  };

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

  useEffect(() => {
    if (view === 'list' && predictors.length === 0) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('tour_completed_first-predictor')) {
          setShowFirstTour(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [view, predictors.length]);

  const handleSelectPredictor = (predictorId: string) => {
    setSelectedPredictorId(predictorId);
    setView('wizard');
  };

  const handleCreatePredictor = async (data: {
    name: string;
    avatar: { bgColor: string; emoji: string };
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
      );
      const updates: {
        avatar?: { bgColor: string; emoji: string };
        favouriteTeamId?: string;
        name?: string;
      } = {};
      if (data.avatar) updates.avatar = data.avatar;
      if (data.favouriteTeamId) updates.favouriteTeamId = data.favouriteTeamId;
      if (Object.keys(updates).length > 0) {
        await predictorService.updatePredictor(user.uid, np.id, updates);
      }
      setPredictors((prev) => [
        ...prev,
        { ...np, avatar: data.avatar, favouriteTeamId: data.favouriteTeamId },
      ]);
      await loadPredictorEntries();
      setView('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePredictor = async (data: {
    name: string;
    avatar: { bgColor: string; emoji: string };
    favouriteTeamId?: string;
  }) => {
    if (!user || !editingPredictor) return;
    setIsSubmitting(true);
    try {
      await predictorService.updatePredictor(user.uid, editingPredictor.id, {
        name: data.name,
        avatar: data.avatar,
        favouriteTeamId: data.favouriteTeamId || null,
      });
      setPredictors((prev) =>
        prev.map((p) =>
          p.id === editingPredictor.id
            ? { ...p, name: data.name, avatar: data.avatar, favouriteTeamId: data.favouriteTeamId }
            : p,
        ),
      );
      await loadPredictorEntries();
      setView('list');
      setEditingPredictor(null);
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

  const listTranslations = {
    ...defaultListTranslations,
    ...translations.predictorList,
  };

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
            translations={{
              favouriteTeamLabel:
                translations.predictorEditor?.favouriteTeamLabel || 'Favorite Team',
              noFavouriteTeam: translations.predictorEditor?.noFavouriteTeam || 'No favorite',
            }}
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
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              resetTour('prediction-wizard');
              setShowWizardTour(true);
            }}
            aria-label="Start guided tour"
          >
            <Icon name="robot" size={16} /> Tour
          </Button>
        </header>

        {showThirdPlaceConfirm ? (
          <section className="predictions-template__section">
            <ThirdPlaceConfirmation
              rankedTeams={thirdPlaceTeams}
              onAdjust={handleThirdPlaceAdjust}
              onContinue={handleThirdPlaceContinue}
              translations={{
                heading: translations.thirdPlaceHeading || 'Third-Placed Teams Qualification',
                subtitle:
                  translations.thirdPlaceSubtitle ||
                  'Best 8 of 12 third-placed teams advance to Round of 32',
                advancing: 'Advancing to Round of 32',
                eliminated: 'Eliminated',
                bracketSlot: 'Match',
                adjust: translations.predictedStandings || 'Adjust Group Predictions',
                continue: translations.buttonNext || 'Continue',
              }}
            />
          </section>
        ) : (
          <>
            <PredictionsProgress stepCounter={stepCounter} deadlineInfo={deadlineInfo} />
            <PredictionsFeedback feedback={feedback} />

            <section className="predictions-template__section">
              <div className="predictions-template__section-header">
                <Typography variant="h2">{activeStep.label}</Typography>
                <Typography variant="body">{activeStep.description}</Typography>
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
                if (currentStep < totalSteps - 1) {
                  await steps[currentStep].onSubmit();
                  setCurrentStep((p) => p + 1);
                } else {
                  await steps[currentStep].onSubmit();
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
              }}
              submittedSteps={submittedSteps}
            />
          </>
        )}
      </main>

      {showWizardTour && (
        <ProductTour
          tourId="prediction-wizard"
          steps={PREDICTION_WIZARD_TOUR}
          onComplete={() => setShowWizardTour(false)}
          onClose={() => setShowWizardTour(false)}
          autoStart={true}
        />
      )}

      {showFirstTour && (
        <ProductTour
          tourId="first-predictor"
          steps={FIRST_PREDICTOR_TOUR}
          onComplete={() => setShowFirstTour(false)}
          onClose={() => setShowFirstTour(false)}
          autoStart={true}
        />
      )}
    </div>
  );
};
