import type { FC } from 'react';
import { useEffect, useState } from 'react';

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

const scoreToString = (value: number | undefined): string =>
  value != null ? value.toString() : '';

export const PredictionInput: FC<PredictionInputProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [homeStr, setHomeStr] = useState<string>(scoreToString(homeScore));
  const [awayStr, setAwayStr] = useState<string>(scoreToString(awayScore));

  useEffect(() => {
    setHomeStr(scoreToString(homeScore));
  }, [homeScore]);

  useEffect(() => {
    setAwayStr(scoreToString(awayScore));
  }, [awayScore]);

  const emitChange = (nextHomeStr: string, nextAwayStr: string) => {
    if (nextHomeStr === '' && nextAwayStr === '') return;
    const home = nextHomeStr === '' ? 0 : parseInt(nextHomeStr, 10);
    const away = nextAwayStr === '' ? 0 : parseInt(nextAwayStr, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || home > 15 || away < 0 || away > 15) {
      return;
    }
    onChange(home, away);
  };

  const handleHomeChange = (value: string) => {
    if (!/^\d{0,2}$/.test(value)) return;
    setHomeStr(value);
    emitChange(value, awayStr);
  };

  const handleAwayChange = (value: string) => {
    if (!/^\d{0,2}$/.test(value)) return;
    setAwayStr(value);
    emitChange(homeStr, value);
  };

  return (
    <div className={`prediction-input ${className}`}>
      <div className="prediction-input__team">
        <Typography variant="small" className="prediction-input__name">
          {homeTeamName}
        </Typography>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={homeStr}
          onChange={(e) => handleHomeChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
          placeholder="0"
        />
      </div>

      <div className="prediction-input__separator">
        <Typography variant="caption">-</Typography>
      </div>

      <div className="prediction-input__team">
        <Typography variant="small" className="prediction-input__name">
          {awayTeamName}
        </Typography>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={awayStr}
          onChange={(e) => handleAwayChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
          placeholder="0"
        />
      </div>
    </div>
  );
};
