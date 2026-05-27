import type { FC } from 'react';

import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
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
  isSubmitting?: boolean;
  submittedSteps?: Set<number>;
  translations: {
    buttonBack: string;
    buttonNext: string;
    buttonFinish?: string;
  };
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
      <Button variant="ghost" size="sm" onClick={onBack} disabled={currentStep === 0}>
        <Icon name="chevron-left" size={16} /> {translations.buttonBack}
      </Button>
      {currentStep < totalSteps - 1 && (
        <Button variant="primary" size="sm" onClick={onNext} disabled={!canAdvance}>
          {translations.buttonNext}
        </Button>
      )}
    </div>
  </>
);
