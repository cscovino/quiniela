import React from 'react';
import { FinalPhaseForm } from '@organisms/FinalPhaseForm/FinalPhaseForm';
import { BestPlayersForm } from '@organisms/BestPlayersForm/BestPlayersForm';
import { Typography } from '@atoms/Typography/Typography';
import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

export interface PredictionStepFinalPhaseProps {
  teams: { fifaCode: string; name: string }[];
  existingPrediction?: { first?: string; second?: string; third?: string; fourth?: string };
  onSubmit: (data: {
    first?: string;
    second?: string;
    third?: string;
    fourth?: string;
  }) => Promise<void>;
  isDisabled: boolean;
  locale: 'en' | 'es';
}

export const PredictionStepFinalPhase: React.FC<PredictionStepFinalPhaseProps> = ({
  teams,
  existingPrediction,
  onSubmit,
  isDisabled,
  locale,
}) => (
  <>
    {teams.length > 0 ? (
      <FinalPhaseForm
        teams={teams}
        onSubmit={onSubmit}
        existingPrediction={existingPrediction}
        isDisabled={isDisabled}
      />
    ) : (
      <div className="predictions-template__empty">
        <Typography variant="body">
          {locale === 'en'
            ? 'Teams will be available soon.'
            : 'Los equipos estarán disponibles pronto.'}
        </Typography>
      </div>
    )}
  </>
);

export interface PredictionStepBestPlayersProps {
  existingPrediction?: { bestGoalkeeper?: string; bestScorer?: string };
  onSubmit: (data: { bestGoalkeeper?: string; bestScorer?: string }) => Promise<void>;
  isDisabled: boolean;
}

export const PredictionStepBestPlayers: React.FC<PredictionStepBestPlayersProps> = ({
  existingPrediction,
  onSubmit,
  isDisabled,
}) => (
  <BestPlayersForm
    onSubmit={onSubmit}
    existingPrediction={existingPrediction}
    isDisabled={isDisabled}
  />
);
