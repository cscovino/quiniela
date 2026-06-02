import type { FC } from 'react';
import { Fragment, useId } from 'react';

import { Radio } from '@atoms/Radio';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';

import './TeamSelector.css';

export interface TeamOption {
  fifaCode: string;
  name: string;
}

export interface TeamSelectorProps {
  options: TeamOption[];
  value?: string;
  onChange: (fifaCode: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const TeamSelector: FC<TeamSelectorProps> = ({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const uniqueId = useId();

  return (
    <div className={`team-selector ${className}`}>
      {label && (
        <Typography variant="small" className="team-selector__label">
          {label}
        </Typography>
      )}
      <div className="team-selector__options">
        {options.map((team, index) => (
          <Fragment key={team.fifaCode}>
            {index === 1 && options.length === 2 && (
              <Typography variant="caption" className="team-selector__vs">
                VS
              </Typography>
            )}
            <label
              className={`team-selector__option ${value === team.fifaCode ? 'team-selector__option--selected' : ''} ${disabled ? 'team-selector__option--disabled' : ''}`}
            >
              <Radio
                name={`team-selector-${uniqueId}`}
                value={team.fifaCode}
                checked={value === team.fifaCode}
                onChange={() => onChange(team.fifaCode)}
                disabled={disabled}
              />
              <TeamFlag fifaCode={team.fifaCode} name={team.name} size="md" showName />
            </label>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
