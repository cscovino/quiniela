import type { FC } from 'react';

import { Typography } from '@atoms/Typography';
import { BestPlayersForm } from '@organisms/BestPlayersForm';
import { FinalPhaseForm } from '@organisms/FinalPhaseForm';

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

export const PredictionStepFinalPhase: FC<PredictionStepFinalPhaseProps> = ({
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

export const PredictionStepBestPlayers: FC<PredictionStepBestPlayersProps> = ({
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
