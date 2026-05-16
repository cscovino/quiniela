import React from 'react';
import { TeamFlag } from '@molecules/TeamFlag/TeamFlag';
import { Radio } from '@atoms/Radio/Radio';
import { Typography } from '@atoms/Typography/Typography';
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

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`team-selector ${className}`}>
      {label && (
        <Typography variant="small" className="team-selector__label">
          {label}
        </Typography>
      )}
      <div className="team-selector__options">
        {options.map((team) => (
          <label
            key={team.fifaCode}
            className={`team-selector__option ${value === team.fifaCode ? 'team-selector__option--selected' : ''} ${disabled ? 'team-selector__option--disabled' : ''}`}
          >
            <Radio
              name="team-selector"
              value={team.fifaCode}
              checked={value === team.fifaCode}
              onChange={() => onChange(team.fifaCode)}
              disabled={disabled}
            />
            <TeamFlag fifaCode={team.fifaCode} name={team.name} size="md" showName />
          </label>
        ))}
      </div>
    </div>
  );
};
