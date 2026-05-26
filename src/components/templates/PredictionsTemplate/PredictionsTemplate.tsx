import React, { useEffect, useState } from 'react';
import { PredictorSelector } from '@molecules/PredictorSelector/PredictorSelector';
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
  };
  locale?: 'en' | 'es';
  className?: string;
}

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
      return;
    }
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

  const handleCreatePredictor = async (name: string) => {
    if (!user) return;
    const np = await predictorService.createPredictor(user.uid, name);
    setPredictors((prev) => [...prev, np]);
    setSelectedPredictorId(np.id);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
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

  if (!selectedPredictorId) {
    const pt = {
      title: translations.predictor.title,
      selectPredictor: translations.predictor.select,
      createPredictor: translations.predictor.create,
      createButton: translations.predictor.createButton,
      namePlaceholder: translations.predictor.namePlaceholder,
      loading: translations.predictor.loading,
      noPredictors: translations.predictor.noPredictors,
      getStarted: translations.predictor.getStarted,
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

  const stepLabels = steps.map((s) => s.label);
  const stepCounter = translations.stepXofY
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(totalSteps));

  const activeStep = steps[currentStep];

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
            <Typography variant="h2">{activeStep.label}</Typography>
            <Typography variant="body">{activeStep.description}</Typography>
          </div>

          {activeStep.content}
        </section>

        <PredictionsNavigation
          onBack={handleBack}
          onNext={handleNext}
          canAdvance={canAdvance}
          currentStep={currentStep}
          totalSteps={totalSteps}
          translations={translations}
          submittedSteps={submittedSteps}
        />
      </main>
    </div>
  );
};
