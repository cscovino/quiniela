import React, { useState, useMemo } from 'react';
import { TeamFlag } from '@molecules/TeamFlag/TeamFlag';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import './GroupPredictionForm.css';

export interface GroupForPrediction {
  slug: string;
  name: string;
  teams: { fifaCode: string; name: string }[];
}

export interface GroupPredictionFormProps {
  groups: GroupForPrediction[];
  onSubmit: (predictions: Record<string, string[]>) => void;
  existingBets: Set<string>;
  isDisabled?: boolean;
  className?: string;
}

export const GroupPredictionForm: React.FC<GroupPredictionFormProps> = ({
  groups,
  onSubmit,
  existingBets,
  isDisabled = false,
  className = '',
}) => {
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableGroups = useMemo(
    () => groups.filter((g) => !existingBets.has(g.slug)),
    [groups, existingBets],
  );

  const handleTeamPositionChange = (groupSlug: string, teamFifaCode: string, position: string) => {
    setPredictions((prev) => {
      const groupPredictions = [...(prev[groupSlug] || [])];
      const currentPos = groupPredictions.indexOf(teamFifaCode);
      if (currentPos !== -1) {
        groupPredictions.splice(currentPos, 1);
      }

      const posIndex = parseInt(position, 10) - 1;
      if (!isNaN(posIndex) && posIndex >= 0 && posIndex < 4) {
        groupPredictions[posIndex] = teamFifaCode;
      }

      return { ...prev, [groupSlug]: groupPredictions };
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[groupSlug];
      return newErrors;
    });
  };

  const validateGroup = (groupSlug: string, teamPositions: string[]): string | null => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (!group) return null;

    const filledPositions = teamPositions.filter((t) => t !== undefined && t !== '');
    const uniqueTeams = new Set(filledPositions);

    if (filledPositions.length < group.teams.length) {
      return 'Rank all teams';
    }

    if (uniqueTeams.size !== group.teams.length) {
      return 'Each team must have a unique position';
    }

    return null;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    for (const group of availableGroups) {
      const teamPositions = predictions[group.slug] || [];
      const error = validateGroup(group.slug, teamPositions);
      if (error) {
        newErrors[group.slug] = error;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const validPredictions: Record<string, string[]> = {};
    for (const group of availableGroups) {
      const teamPositions = predictions[group.slug] || [];
      if (teamPositions.length === groups.find((g) => g.slug === group.slug)!.teams.length) {
        validPredictions[group.slug] = teamPositions;
      }
    }

    if (Object.keys(validPredictions).length > 0) {
      onSubmit(validPredictions);
    }
  };

  if (availableGroups.length === 0) {
    return (
      <div className={`group-prediction-form group-prediction-form--empty ${className}`}>
        <Typography variant="body">
          All group predictions have been submitted or the deadline has passed.
        </Typography>
      </div>
    );
  }

  return (
    <div className={`group-prediction-form ${className}`}>
      <div className="group-prediction-form__groups">
        {availableGroups.map((group) => {
          const groupPredictions = predictions[group.slug] || [];
          const error = errors[group.slug];

          return (
            <div key={group.slug} className="group-prediction-form__group">
              <div className="group-prediction-form__header">
                <Typography variant="h3">{group.name}</Typography>
              </div>

              {error && (
                <div className="group-prediction-form__error">
                  <Typography variant="caption">{error}</Typography>
                </div>
              )}

              <div className="group-prediction-form__teams">
                <div className="group-prediction-form__row group-prediction-form__row--header">
                  <span className="group-prediction-form__col team">Team</span>
                  <span className="group-prediction-form__col position">Position</span>
                </div>

                {group.teams.map((team) => {
                  const currentPosition = groupPredictions.indexOf(team.fifaCode);
                  const positionValue =
                    currentPosition !== -1 ? (currentPosition + 1).toString() : '';

                  return (
                    <div key={team.fifaCode} className="group-prediction-form__row">
                      <span className="group-prediction-form__col team">
                        <TeamFlag fifaCode={team.fifaCode} size="sm" />
                        {team.name}
                      </span>
                      <span className="group-prediction-form__col position">
                        <select
                          className="group-prediction-form__select"
                          value={positionValue}
                          onChange={(e) =>
                            handleTeamPositionChange(group.slug, team.fifaCode, e.target.value)
                          }
                          disabled={isDisabled}
                        >
                          <option value="">Select</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                        </select>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="group-prediction-form__actions">
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={isDisabled}>
          Submit Group Predictions
        </Button>
      </div>
    </div>
  );
};
