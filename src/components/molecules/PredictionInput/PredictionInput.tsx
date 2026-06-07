import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';

import './PredictionInput.css';

export interface PredictionInputProps {
  homeScore?: number;
  awayScore?: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
  className?: string;
}

const scoreToString = (value: number | undefined): string =>
  value != null ? value.toString() : '';

export const PredictionInput: FC<PredictionInputProps> = ({
  homeScore,
  awayScore,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [homeStr, setHomeStr] = useState<string>(scoreToString(homeScore));
  const [awayStr, setAwayStr] = useState<string>(scoreToString(awayScore));

  // Once the user types into a field, that field is owned by local state and
  // must not be clobbered by prop updates (e.g., async Firestore fetch
  // completing while the user is mid-typing, or sibling-step submit ripples).
  const homeDirtyRef = useRef(false);
  const awayDirtyRef = useRef(false);

  useEffect(() => {
    if (homeDirtyRef.current) return;
    setHomeStr(scoreToString(homeScore));
  }, [homeScore]);

  useEffect(() => {
    if (awayDirtyRef.current) return;
    setAwayStr(scoreToString(awayScore));
  }, [awayScore]);

  const emitChange = (nextHomeStr: string, nextAwayStr: string) => {
    if (nextHomeStr === '' || nextAwayStr === '') return;
    const home = parseInt(nextHomeStr, 10);
    const away = parseInt(nextAwayStr, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || home > 15 || away < 0 || away > 15) {
      return;
    }
    onChange(home, away);
  };

  const handleHomeChange = (value: string) => {
    if (!/^\d{0,2}$/.test(value)) return;
    homeDirtyRef.current = true;
    setHomeStr(value);
    emitChange(value, awayStr);
  };

  const handleAwayChange = (value: string) => {
    if (!/^\d{0,2}$/.test(value)) return;
    awayDirtyRef.current = true;
    setAwayStr(value);
    emitChange(homeStr, value);
  };

  return (
    <div className={`prediction-input ${className}`}>
      <div className="prediction-input__team">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={homeStr}
          onChange={(e) => handleHomeChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
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
          value={awayStr}
          onChange={(e) => handleAwayChange(e.target.value)}
          disabled={disabled}
          className="prediction-input__field"
        />
      </div>
    </div>
  );
};
