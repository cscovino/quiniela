import React from 'react';
import { PredictionForm, type MatchPrediction } from '@organisms/PredictionForm/PredictionForm';
import { Typography } from '@atoms/Typography/Typography';
import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

export interface PredictionStepMatchesProps {
  matches: MatchPrediction[];
  existingMatchBets: Set<string>;
  teamsMap: Record<string, { fifaCode: string; name: string }>;
  onSubmit: (
    predictions: Record<string, { home?: number; away?: number; winner?: string }>,
  ) => Promise<void>;
  onPredictionsChange: (
    predictions: Record<string, { home?: number; away?: number; winner?: string }>,
  ) => void;
  isDisabled: boolean;
  locale: 'en' | 'es';
}

export const PredictionStepMatches: React.FC<PredictionStepMatchesProps> = ({
  matches,
  existingMatchBets,
  onSubmit,
  onPredictionsChange,
  isDisabled,
  locale,
}) => {
  const availableMatches = matches.filter((m) => !existingMatchBets.has(m.matchId));

  if (availableMatches.length === 0) {
    return (
      <div className="predictions-template__empty">
        <Typography variant="body">
          {locale === 'en'
            ? 'No matches available for prediction. All scheduled matches have been predicted or deadlines have passed.'
            : 'No hay partidos disponibles para predecir. Todos los partidos programados han sido pronosticados o los plazos han pasado.'}
        </Typography>
      </div>
    );
  }

  return (
    <PredictionForm
      matches={availableMatches}
      onSubmit={onSubmit}
      onPredictionsChange={onPredictionsChange}
      isDisabled={isDisabled}
    />
  );
};
