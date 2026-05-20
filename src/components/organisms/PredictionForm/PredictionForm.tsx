import React, { useState } from 'react';
import { PredictionInput } from '@molecules/PredictionInput/PredictionInput';
import { TeamSelector } from '@molecules/TeamSelector/TeamSelector';
import { TeamFlag } from '@molecules/TeamFlag/TeamFlag';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import './PredictionForm.css';

export interface MatchPrediction {
  matchId: string;
  homeTeam: { fifaCode: string; name: string };
  awayTeam: { fifaCode: string; name: string };
  phase: 'group' | 'knockout';
  predictionDeadline: Date;
}

export interface PredictionFormProps {
  matches: MatchPrediction[];
  onSubmit: (
    predictions: Record<string, { home?: number; away?: number; winner?: string }>,
  ) => void;
  onPredictionsChange?: (
    predictions: Record<string, { home?: number; away?: number; winner?: string }>,
  ) => void;
  isDisabled?: boolean;
  className?: string;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  matches,
  onSubmit,
  onPredictionsChange,
  isDisabled = false,
  className = '',
}) => {
  const [predictions, setPredictions] = useState<
    Record<string, { home?: number; away?: number; winner?: string }>
  >({});

  const handleGroupPrediction = (matchId: string, home: number, away: number) => {
    setPredictions((prev) => {
      const next = { ...prev, [matchId]: { home, away } };
      onPredictionsChange?.(next);
      return next;
    });
  };

  const handleKnockoutPrediction = (matchId: string, winner: string) => {
    setPredictions((prev) => {
      const next = { ...prev, [matchId]: { winner } };
      onPredictionsChange?.(next);
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(predictions);
  };

  if (matches.length === 0) {
    return (
      <div className={`prediction-form prediction-form--empty ${className}`}>
        <Typography variant="body">No matches available for prediction</Typography>
      </div>
    );
  }

  return (
    <div className={`prediction-form ${className}`}>
      <div className="prediction-form__grid">
        {matches.map((match) => (
          <div key={match.matchId} className="prediction-form__card">
            <div className="prediction-form__teams">
              <div className="prediction-form__team">
                <TeamFlag fifaCode={match.homeTeam.fifaCode} size="md" />
                <Typography variant="small">{match.homeTeam.name}</Typography>
              </div>
              <Typography variant="caption" className="prediction-form__vs">
                VS
              </Typography>
              <div className="prediction-form__team">
                <TeamFlag fifaCode={match.awayTeam.fifaCode} size="md" />
                <Typography variant="small">{match.awayTeam.name}</Typography>
              </div>
            </div>

            {match.phase === 'group' ? (
              <PredictionInput
                homeTeamName=""
                awayTeamName=""
                homeScore={predictions[match.matchId]?.home}
                awayScore={predictions[match.matchId]?.away}
                onChange={(home, away) => handleGroupPrediction(match.matchId, home, away)}
                disabled={isDisabled}
              />
            ) : (
              <TeamSelector
                options={[match.homeTeam, match.awayTeam]}
                value={predictions[match.matchId]?.winner}
                onChange={(winner) => handleKnockoutPrediction(match.matchId, winner)}
                label="Pick the winner"
                disabled={isDisabled}
              />
            )}
          </div>
        ))}
      </div>

      <div className="prediction-form__actions">
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={isDisabled}>
          Submit Predictions
        </Button>
      </div>
    </div>
  );
};
