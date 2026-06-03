import type { FC } from 'react';

import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';

import './PredictionInput.css';

export interface PredictionInputProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
  className?: string;
}

export const PredictionInput: FC<PredictionInputProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore = 0,
  awayScore = 0,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleHomeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 15) {
      onChange(num, awayScore);
    }
  };

  const handleAwayChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 15) {
      onChange(homeScore, num);
    }
  };

  return (
    <div className={`prediction-input ${className}`}>
      <div className="prediction-input__team">
        <Typography variant="small" className="prediction-input__label">
          {homeTeamName}
        </Typography>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={homeScore.toString()}
          onChange={(e) => handleHomeChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
          min="0"
          max="15"
        />
      </div>

      <div className="prediction-input__separator">
        <Typography variant="caption">-</Typography>
      </div>

      <div className="prediction-input__team">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={awayScore.toString()}
          onChange={(e) => handleAwayChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
          min="0"
          max="15"
        />
        <Typography variant="small" className="prediction-input__label">
          {awayTeamName}
        </Typography>
      </div>
    </div>
  );
};
