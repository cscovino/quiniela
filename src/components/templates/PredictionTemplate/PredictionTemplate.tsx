import React from 'react';
import { PredictionForm, type PredictionFormProps } from '@organisms/PredictionForm/PredictionForm';
import { CountdownTimer } from '@molecules/CountdownTimer/CountdownTimer';
import { Typography } from '@atoms/Typography/Typography';
import './PredictionTemplate.css';

export interface PredictionTemplateProps {
  formProps: PredictionFormProps;
  deadline?: Date;
  translations: {
    title: string;
    timeRemaining: string;
  };
  onSubmit?: (predictions: PredictionFormProps['matches']) => void;
  className?: string;
}

export const PredictionTemplate: React.FC<PredictionTemplateProps> = ({
  formProps,
  deadline,
  translations,
  onSubmit,
  className = '',
}) => {
  return (
    <div className={`prediction-template ${className}`}>
      <main className="prediction-template__content">
        <header className="prediction-template__header">
          <Typography variant="h1">{translations.title}</Typography>
          {deadline && (
            <div className="prediction-template__countdown">
              <Typography variant="small">{translations.timeRemaining}</Typography>
              <CountdownTimer targetDate={deadline} />
            </div>
          )}
        </header>

        <section className="prediction-template__form">
          <PredictionForm {...formProps} onSubmit={onSubmit} />
        </section>
      </main>
    </div>
  );
};
