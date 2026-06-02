import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { RegisterStepState } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';

import './FinalPhaseForm.css';

export interface FinalPhaseFormProps {
  teams: { fifaCode: string; name: string }[];
  onSubmit: (data: { first?: string; second?: string; third?: string; fourth?: string }) => void;
  existingPrediction?: { first?: string; second?: string; third?: string; fourth?: string };
  derivedPrefill?: { first: string; second: string; third: string; fourth: string };
  isDisabled?: boolean;
  isSubmitting?: boolean;
  /** When provided, the form reports its submit to the wizard's Next button and hides its own. */
  onStateChange?: RegisterStepState;
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
  derivedPrefill,
  isDisabled = false,
  isSubmitting = false,
  onStateChange,
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

  // Seed empty selects from derivedPrefill; never overwrite an existing pick or write 'TBD'
  useEffect(() => {
    if (!derivedPrefill) return;
    setSelections((prev) => ({
      first: prev.first || (derivedPrefill.first !== 'TBD' ? derivedPrefill.first : ''),
      second: prev.second || (derivedPrefill.second !== 'TBD' ? derivedPrefill.second : ''),
      third: prev.third || (derivedPrefill.third !== 'TBD' ? derivedPrefill.third : ''),
      fourth: prev.fourth || (derivedPrefill.fourth !== 'TBD' ? derivedPrefill.fourth : ''),
    }));
  }, [derivedPrefill]);

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

  const canSubmit = !!isComplete && isUnique && !isDisabled;

  useEffect(() => {
    // Optional step: always advanceable, but only persist when fully valid.
    onStateChange?.({
      canAdvance: true,
      submit: async () => {
        if (!canSubmit) return;
        handleSubmit();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, selections, onStateChange]);

  return (
    <div className={`final-phase-form ${className}`}>
      <div className="final-phase-form__positions">
        {POSITION_KEYS.map((key, index) => (
          <div
            key={key}
            className={`final-phase-form__position${
              derivedPrefill && !existingPrediction?.[key] && selections[key]
                ? ' final-phase-form__position--prefilled'
                : ''
            }`}
          >
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

      {!onStateChange && (
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
      )}
    </div>
  );
};
