import type { FC } from 'react';

import { Typography } from '@atoms/Typography';
import { BestPlayersForm, type BestPlayersFormProps } from '@organisms/BestPlayersForm';
import { FinalPhaseForm, type FinalPhaseFormProps } from '@organisms/FinalPhaseForm';

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
  isSubmitting?: boolean;
  locale: 'en' | 'es';
  translations?: {
    teamsSoon?: string;
    form?: FinalPhaseFormProps['translations'];
  };
}

export const PredictionStepFinalPhase: FC<PredictionStepFinalPhaseProps> = ({
  teams,
  existingPrediction,
  onSubmit,
  isDisabled,
  isSubmitting = false,
  locale,
  translations = {},
}) => {
  const teamsSoon =
    translations.teamsSoon ??
    (locale === 'en' ? 'Teams will be available soon.' : 'Los equipos estarán disponibles pronto.');
  return (
    <>
      {teams.length > 0 ? (
        <FinalPhaseForm
          teams={teams}
          onSubmit={onSubmit}
          existingPrediction={existingPrediction}
          isDisabled={isDisabled}
          isSubmitting={isSubmitting}
          translations={translations.form}
        />
      ) : (
        <div className="predictions-template__empty">
          <Typography variant="body">{teamsSoon}</Typography>
        </div>
      )}
    </>
  );
};

export interface PredictionStepBestPlayersProps {
  existingPrediction?: { bestGoalkeeper?: string; bestScorer?: string };
  onSubmit: (data: { bestGoalkeeper?: string; bestScorer?: string }) => Promise<void>;
  isDisabled: boolean;
  isSubmitting?: boolean;
  translations?: BestPlayersFormProps['translations'];
}

export const PredictionStepBestPlayers: FC<PredictionStepBestPlayersProps> = ({
  existingPrediction,
  onSubmit,
  isDisabled,
  isSubmitting = false,
  translations,
}) => (
  <BestPlayersForm
    onSubmit={onSubmit}
    existingPrediction={existingPrediction}
    isDisabled={isDisabled}
    isSubmitting={isSubmitting}
    translations={translations}
  />
);
