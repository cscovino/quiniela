import type { FC } from 'react';

import { Typography } from '@atoms/Typography';

import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

export interface PredictionsProgressProps {
  stepCounter: string;
}

export const PredictionsProgress: FC<PredictionsProgressProps> = ({ stepCounter }) => {
  return <div className="predictions-template__step-counter">{stepCounter}</div>;
};

export interface PredictionsFeedbackProps {
  feedback: { type: 'success' | 'error'; message: string } | null;
}

export const PredictionsFeedback: FC<PredictionsFeedbackProps> = ({ feedback }) => {
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
}

export const PredictionsNavigation: FC<PredictionsNavigationProps> = ({
  onBack,
  onNext,
  canAdvance,
  currentStep,
  totalSteps,
  translations,
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
  </>
);
