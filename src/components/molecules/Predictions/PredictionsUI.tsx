import React from 'react';
import { Typography } from '@atoms/Typography/Typography';
import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

export interface PredictionsProgressProps {
  stepLabels: string[];
  currentStep: number;
  submittedSteps: Set<number>;
  stepCounter: string;
}

export const PredictionsProgress: React.FC<PredictionsProgressProps> = ({
  stepLabels,
  currentStep,
  submittedSteps,
  stepCounter,
}) => (
  <>
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
    <div className="predictions-template__step-counter">{stepCounter}</div>
  </>
);

export interface PredictionsFeedbackProps {
  feedback: { type: 'success' | 'error'; message: string } | null;
}

export const PredictionsFeedback: React.FC<PredictionsFeedbackProps> = ({ feedback }) => {
  if (!feedback) return null;
  return (
    <div
      className={`predictions-template__feedback predictions-template__feedback--${feedback.type}`}
    >
      <Typography variant="small">{feedback.message}</Typography>
    </div>
  );
};

export interface PredictionsNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  currentStep: number;
  totalSteps: number;
  translations: { buttonBack: string; buttonNext: string; submitToAdvance: string };
  submittedSteps: Set<number>;
}

export const PredictionsNavigation: React.FC<PredictionsNavigationProps> = ({
  onBack,
  onNext,
  canAdvance,
  currentStep,
  totalSteps,
  translations,
  submittedSteps,
}) => (
  <>
    <div className="predictions-template__navigation">
      <button
        type="button"
        className="predictions-template__nav-btn"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        {translations.buttonBack}
      </button>
      {currentStep < totalSteps - 1 && (
        <button
          type="button"
          className="predictions-template__nav-btn predictions-template__nav-btn--primary"
          onClick={onNext}
          disabled={!canAdvance}
        >
          {translations.buttonNext}
        </button>
      )}
    </div>
    {!submittedSteps.has(currentStep) && (
      <div className="predictions-template__hint">
        <Typography variant="small">{translations.submitToAdvance}</Typography>
      </div>
    )}
  </>
);
