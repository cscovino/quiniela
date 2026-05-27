import type { FC } from 'react';

import type { ThirdPlacedTeam } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';

import './ThirdPlaceConfirmation.css';

export interface ThirdPlaceConfirmationProps {
  rankedTeams: ThirdPlacedTeam[];
  onAdjust: () => void;
  onContinue: () => void;
  translations: {
    heading: string;
    subtitle: string;
    advancing: string;
    eliminated: string;
    bracketSlot: string;
    adjust: string;
    continue: string;
  };
}

const defaultTranslations = {
  heading: 'Third-Placed Teams Qualification',
  subtitle: 'Best 8 of 12 third-placed teams advance to Round of 32',
  advancing: 'Advancing to Round of 32',
  eliminated: 'Eliminated',
  bracketSlot: 'Match',
  adjust: 'Adjust Group Predictions',
  continue: 'Continue to Knockout',
};

export const ThirdPlaceConfirmation: FC<ThirdPlaceConfirmationProps> = ({
  rankedTeams,
  onAdjust,
  onContinue,
  translations,
}) => {
  const t = { ...defaultTranslations, ...translations };
  const advancing = rankedTeams.filter((t) => t.advancing);
  const eliminated = rankedTeams.filter((t) => !t.advancing);

  return (
    <div className="third-place-confirmation">
      <div className="third-place-confirmation__header">
        <Typography variant="h2" className="third-place-confirmation__heading">
          {t.heading}
        </Typography>
        <Typography variant="body" className="third-place-confirmation__subtitle">
          {t.subtitle}
        </Typography>
      </div>

      <div className="third-place-confirmation__advancing">
        <Typography
          variant="h3"
          className="third-place-confirmation__section-title third-place-confirmation__section-title--advancing"
        >
          {t.advancing}
        </Typography>
        <div className="third-place-confirmation__list">
          {advancing.map((team, index) => (
            <div key={team.teamId} className="third-place-confirmation__row">
              <span className="third-place-confirmation__rank">{index + 1}.</span>
              <span className="third-place-confirmation__team-name">{team.teamName}</span>
              <span className="third-place-confirmation__group">(Group {team.groupLetter})</span>
              <span className="third-place-confirmation__points third-place-confirmation__points--advancing">
                {team.points} pts
              </span>
              {team.bracketSlotLabel && (
                <span className="third-place-confirmation__bracket-slot">
                  &#8594; {t.bracketSlot} {team.bracketSlotLabel.replace('Match ', '')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="third-place-confirmation__eliminated">
        <Typography
          variant="h3"
          className="third-place-confirmation__section-title third-place-confirmation__section-title--eliminated"
        >
          {t.eliminated}
        </Typography>
        <div className="third-place-confirmation__list">
          {eliminated.map((team, index) => (
            <div key={team.teamId} className="third-place-confirmation__row">
              <span className="third-place-confirmation__rank">
                {advancing.length + index + 1}.
              </span>
              <span className="third-place-confirmation__team-name">{team.teamName}</span>
              <span className="third-place-confirmation__group">(Group {team.groupLetter})</span>
              <span className="third-place-confirmation__points third-place-confirmation__points--eliminated">
                {team.points} {team.points === 1 ? 'pt' : 'pts'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="third-place-confirmation__actions">
        <Button variant="ghost" size="md" onClick={onAdjust}>
          {t.adjust}
        </Button>
        <Button variant="primary" size="md" onClick={onContinue}>
          {t.continue}
        </Button>
      </div>
    </div>
  );
};
