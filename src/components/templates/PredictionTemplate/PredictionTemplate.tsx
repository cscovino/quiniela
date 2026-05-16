import React from 'react';
import { NavBar, type NavBarProps } from '@organisms/NavBar/NavBar';
import { PredictionForm, type PredictionFormProps } from '@organisms/PredictionForm/PredictionForm';
import { CountdownTimer } from '@molecules/CountdownTimer/CountdownTimer';
import { Typography } from '@atoms/Typography/Typography';
import './PredictionTemplate.css';

export interface PredictionTemplateProps {
  navProps: NavBarProps;
  formProps: PredictionFormProps;
  deadline?: Date;
  onSubmit?: (predictions: PredictionFormProps['matches']) => void;
  className?: string;
}

export const PredictionTemplate: React.FC<PredictionTemplateProps> = ({
  navProps,
  formProps,
  deadline,
  onSubmit,
  className = '',
}) => {
  return (
    <div className={`prediction-template ${className}`}>
      <NavBar {...navProps} />

      <main className="prediction-template__content">
        <header className="prediction-template__header">
          <Typography variant="h1">Matchday Predictions</Typography>
          {deadline && (
            <div className="prediction-template__countdown">
              <Typography variant="small">Time remaining:</Typography>
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
