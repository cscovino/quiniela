import React, { useState } from 'react';
import { PredictionInput } from '@molecules/PredictionInput/PredictionInput';
import { TeamSelector } from '@molecules/TeamSelector/TeamSelector';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { CountdownTimer } from '@molecules/CountdownTimer/CountdownTimer';
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
  isDisabled?: boolean;
  className?: string;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  matches,
  onSubmit,
  isDisabled = false,
  className = '',
}) => {
  const [predictions, setPredictions] = useState<
    Record<string, { home?: number; away?: number; winner?: string }>
  >({});

  const handleGroupPrediction = (matchId: string, home: number, away: number) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { home, away },
    }));
  };

  const handleKnockoutPrediction = (matchId: string, winner: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { winner },
    }));
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
      <div className="prediction-form__matches">
        {matches.map((match) => (
          <div key={match.matchId} className="prediction-form__match">
            <div className="prediction-form__header">
              <Typography variant="small">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </Typography>
              <CountdownTimer
                targetDate={match.predictionDeadline}
                label="Deadline"
                expiredText="Closed"
              />
            </div>

            {match.phase === 'group' ? (
              <PredictionInput
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
                homeScore={predictions[match.matchId]?.home}
                awayScore={predictions[match.matchId]?.away}
                onChange={(home, away) => handleGroupPrediction(match.matchId, home, away)}
                disabled={isDisabled || match.predictionDeadline.getTime() <= Date.now()}
              />
            ) : (
              <TeamSelector
                options={[match.homeTeam, match.awayTeam]}
                value={predictions[match.matchId]?.winner}
                onChange={(winner) => handleKnockoutPrediction(match.matchId, winner)}
                label="Pick the winner"
                disabled={isDisabled || match.predictionDeadline.getTime() <= Date.now()}
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
