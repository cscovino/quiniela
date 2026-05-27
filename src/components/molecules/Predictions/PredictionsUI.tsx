import type { FC } from 'react';

import type { DeadlineInfo } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';

import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

export interface PredictionsProgressProps {
  stepCounter: string;
  deadlineInfo?: DeadlineInfo;
}

export const PredictionsProgress: FC<PredictionsProgressProps> = ({
  stepCounter,
  deadlineInfo,
}) => {
  return (
    <div className="predictions-template__step-counter">
      <Typography variant="small">{stepCounter}</Typography>
      {deadlineInfo && (
        <Typography variant="small" className="predictions-template__deadline">
          {deadlineInfo.label}
        </Typography>
      )}
      {deadlineInfo?.countdownLabel && (
        <Typography variant="small" className="predictions-template__deadline-countdown">
          {deadlineInfo.countdownLabel}
        </Typography>
      )}
    </div>
  );
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
  isSubmitting,
  translations,
}) => (
  <>
    <div className="predictions-template__navigation">
      <Button variant="ghost" size="sm" onClick={onBack} disabled={currentStep === 0}>
        <Icon name="chevron-left" size={16} /> {translations.buttonBack}
      </Button>
      <Button variant="primary" size="sm" onClick={onNext} disabled={!canAdvance || isSubmitting}>
        {isSubmitting ? <Spinner size="sm" /> : null}
        {currentStep < totalSteps - 1
          ? translations.buttonNext
          : translations.buttonFinish || 'Finish'}
      </Button>
    </div>
  </>
);
