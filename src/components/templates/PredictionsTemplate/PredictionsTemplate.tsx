import React, { useEffect, useState, useCallback } from 'react';
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList/PredictorList';
import { PredictorEditor } from '@molecules/PredictorEditor/PredictorEditor';
import { PredictorDeleteConfirm } from '@molecules/PredictorDeleteConfirm/PredictorDeleteConfirm';
import { getLoginRoute } from '@utils/i18n';
import {
  PredictionsProgress,
  PredictionsFeedback,
  PredictionsNavigation,
} from '@molecules/Predictions/PredictionsUI';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { predictorService } from '@services/predictor-service';
import { useAuthStore } from '@store/auth-store';
import type { Predictor } from '@app-types/firestore';
import { usePredictionSteps } from '@hooks/usePredictionSteps';
import { ProductTour, resetTour } from '@organisms/ProductTour/ProductTour';
import { PREDICTION_WIZARD_TOUR, FIRST_PREDICTOR_TOUR } from '@organisms/ProductTour/tours';
import './PredictionsTemplate.css';

type PredictorView = 'list' | 'wizard' | 'editor' | 'delete';

export interface PredictionsTemplateProps {
  translations: {
    title: string;
    noMatches: string;
    submitSuccess: string;
    submitError: string;
    loginRequired: string;
    loginButton: string;
    loading: string;
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

export const PredictionsTemplate: React.FC<PredictionsTemplateProps> = ({
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

  const {
    loading: stepsLoading,
    steps,
    currentStep,
    setCurrentStep,
    submittedSteps,
    feedback,
    totalSteps,
    canAdvance,
  } = usePredictionSteps(translations, locale, selectedPredictorId);

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
        points: r.stats?.points,
        groupsDone: r.progress.groupsSubmitted,
        groupsTotal: r.progress.totalGroups,
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
  }) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const np = await predictorService.createPredictor(user.uid, data.name);
      if (data.avatar) {
        await predictorService.updatePredictor(user.uid, np.id, { avatar: data.avatar });
      }
      setPredictors((prev) => [...prev, { ...np, avatar: data.avatar }]);
      await loadPredictorEntries();
      setView('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePredictor = async (data: {
    name: string;
    avatar: { bgColor: string; emoji: string };
  }) => {
    if (!user || !editingPredictor) return;
    setIsSubmitting(true);
    try {
      await predictorService.updatePredictor(user.uid, editingPredictor.id, {
        name: data.name,
        avatar: data.avatar,
      });
      setPredictors((prev) =>
        prev.map((p) =>
          p.id === editingPredictor.id ? { ...p, name: data.name, avatar: data.avatar } : p,
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

  const loading = stepsLoading || isAuthLoading || predictorsLoading;

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
          <a href={getLoginRoute(locale)}>
            <button type="button" className="predictions-template__login-btn">
              {translations.loginButton}
            </button>
          </a>
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
            <button
              type="button"
              className="predictions-template__back-btn"
              onClick={handleBackToList}
            >
              ← {listTranslations.backToPredictors}
            </button>
          </header>

          <PredictorEditor
            mode={editingPredictor ? 'edit' : 'create'}
            predictor={editingPredictor || undefined}
            onSave={editingPredictor ? handleUpdatePredictor : handleCreatePredictor}
            onCancel={handleBackToList}
            isSubmitting={isSubmitting}
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
            <button
              type="button"
              className="predictions-template__back-btn"
              onClick={handleBackToList}
            >
              ← {listTranslations.backToPredictors}
            </button>
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

  const stepLabels = steps.map((s) => s.label);
  const stepCounter = translations.stepXofY
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(totalSteps));

  const activeStep = steps[currentStep];

  return (
    <div className={`predictions-template ${className}`}>
      <main className="predictions-template__content">
        <header className="predictions-template__header">
          <button
            type="button"
            className="predictions-template__back-btn"
            onClick={handleBackToList}
          >
            ← {listTranslations.backToPredictors}
          </button>
          <button
            type="button"
            className="predictions-template__tour-btn"
            onClick={() => {
              resetTour('prediction-wizard');
              setShowWizardTour(true);
            }}
            aria-label="Start guided tour"
          >
            🎮 Tour
          </button>
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
            <Typography variant="h2">{activeStep.label}</Typography>
            <Typography variant="body">{activeStep.description}</Typography>
          </div>

          {activeStep.content}
        </section>

        <PredictionsNavigation
          onBack={handleBackToList}
          onNext={() => {
            if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
          }}
          canAdvance={canAdvance}
          currentStep={currentStep}
          totalSteps={totalSteps}
          translations={translations}
          submittedSteps={submittedSteps}
        />
      </main>

      {showWizardTour && (
        <ProductTour
          tourId="prediction-wizard"
          steps={PREDICTION_WIZARD_TOUR}
          onComplete={() => setShowWizardTour(false)}
          onClose={() => setShowWizardTour(false)}
        />
      )}

      {showFirstTour && (
        <ProductTour
          tourId="first-predictor"
          steps={FIRST_PREDICTOR_TOUR}
          onComplete={() => setShowFirstTour(false)}
          onClose={() => setShowFirstTour(false)}
        />
      )}
    </div>
  );
};
