import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';

import './FinalPhaseForm.css';

export interface FinalPhaseFormProps {
  teams: { fifaCode: string; name: string }[];
  onSubmit: (data: { first?: string; second?: string; third?: string; fourth?: string }) => void;
  existingPrediction?: { first?: string; second?: string; third?: string; fourth?: string };
  isDisabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
  translations?: {
    firstPlace?: string;
    secondPlace?: string;
    thirdPlace?: string;
    fourthPlace?: string;
    selectTeam?: string;
    uniqueWarning?: string;
    submit?: string;
  };
}

const defaultTranslations = {
  firstPlace: '1st Place',
  secondPlace: '2nd Place',
  thirdPlace: '3rd Place',
  fourthPlace: '4th Place',
  selectTeam: 'Select team...',
  uniqueWarning: 'Each team can only be selected once',
  submit: 'Submit Final Phase',
};

const POSITION_KEYS: ('first' | 'second' | 'third' | 'fourth')[] = [
  'first',
  'second',
  'third',
  'fourth',
];

export const FinalPhaseForm: FC<FinalPhaseFormProps> = ({
  teams,
  onSubmit,
  existingPrediction,
  isDisabled = false,
  isSubmitting = false,
  className = '',
  translations = {},
}) => {
  const labels = { ...defaultTranslations, ...translations };
  const positionLabels = [
    labels.firstPlace,
    labels.secondPlace,
    labels.thirdPlace,
    labels.fourthPlace,
  ];
  const [selections, setSelections] = useState({
    first: existingPrediction?.first || '',
    second: existingPrediction?.second || '',
    third: existingPrediction?.third || '',
    fourth: existingPrediction?.fourth || '',
  });

  const handlePositionChange = (position: string, fifaCode: string) => {
    setSelections((prev) => ({ ...prev, [position]: fifaCode }));
  };

  const handleSubmit = () => {
    const { first, second, third, fourth } = selections;
    if (!first && !second && !third && !fourth) return;

    onSubmit({
      ...(first && { first }),
      ...(second && { second }),
      ...(third && { third }),
      ...(fourth && { fourth }),
    });
  };

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  const selectedTeams = new Set(Object.values(selections).filter(Boolean));

  const isComplete = selections.first && selections.second && selections.third && selections.fourth;
  const isUnique =
    new Set(
      [selections.first, selections.second, selections.third, selections.fourth].filter(Boolean),
    ).size ===
    [selections.first, selections.second, selections.third, selections.fourth].filter(Boolean)
      .length;

  return (
    <div className={`final-phase-form ${className}`}>
      <div className="final-phase-form__positions">
        {POSITION_KEYS.map((key, index) => (
          <div key={key} className="final-phase-form__position">
            <div className="final-phase-form__position-header">
              <span className={`final-phase-form__badge final-phase-form__badge--${index + 1}`}>
                #{index + 1}
              </span>
              <Typography variant="h3">{positionLabels[index]}</Typography>
            </div>
            <select
              className="final-phase-form__select"
              value={selections[key]}
              onChange={(e) => handlePositionChange(key, e.target.value)}
              disabled={isDisabled}
            >
              <option value="">{labels.selectTeam}</option>
              {sortedTeams.map((team) => {
                const isSelectedElsewhere =
                  selectedTeams.has(team.fifaCode) && selections[key] !== team.fifaCode;
                return (
                  <option
                    key={`${key}-${team.fifaCode}`}
                    value={team.fifaCode}
                    disabled={isSelectedElsewhere}
                  >
                    {team.name}
                  </option>
                );
              })}
            </select>
            {selections[key] && (
              <div className="final-phase-form__selected">
                <TeamFlag fifaCode={selections[key]} size="md" />
                <Typography variant="small">
                  {teams.find((t) => t.fifaCode === selections[key])?.name}
                </Typography>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isUnique && (
        <div className="final-phase-form__warning">
          <Typography variant="small">{labels.uniqueWarning}</Typography>
        </div>
      )}

      <div className="final-phase-form__actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isDisabled || isSubmitting || !isComplete || !isUnique}
        >
          {isSubmitting ? <Spinner size="sm" /> : null}
          {labels.submit}
        </Button>
      </div>
    </div>
  );
};
