import React from 'react';
import {
  GroupPredictionForm,
  type GroupForPrediction,
} from '@organisms/GroupPredictionForm/GroupPredictionForm';
import { Typography } from '@atoms/Typography/Typography';
import '../../templates/PredictionsTemplate/PredictionsTemplate.css';

interface PredictedStanding {
  teamId: string;
  fifaCode: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface PredictionStepGroupsProps {
  groups: GroupForPrediction[];
  predictedStandings: Record<string, PredictedStanding[]>;
  existingGroupBets: Set<string>;
  onSubmit: (predictions: Record<string, string[]>) => Promise<void>;
  isDisabled: boolean;
  locale: 'en' | 'es';
  translations: {
    stepGroups: string;
    stepGroupsDesc: string;
    predictedStandings: string;
    team: string;
    pts: string;
  };
}

export const PredictionStepGroups: React.FC<PredictionStepGroupsProps> = ({
  groups,
  predictedStandings,
  existingGroupBets,
  onSubmit,
  isDisabled,
  locale,
  translations,
}) => (
  <>
    {Object.keys(predictedStandings).length > 0 && (
      <div className="predictions-template__predicted-standings">
        <Typography variant="h3">{translations.predictedStandings}</Typography>
        {Object.entries(predictedStandings).map(([groupId, standings]) => (
          <div key={groupId} className="predictions-template__predicted-group">
            <Typography variant="small" className="predictions-template__group-name">
              {groups.find((g) => g.slug === groupId)?.name || groupId}
            </Typography>
            <table className="predictions-template__predicted-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{translations.team}</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>{translations.pts}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.teamId}>
                    <td>{i + 1}</td>
                    <td className="predictions-template__team-cell">{s.fifaCode}</td>
                    <td>{s.played}</td>
                    <td>{s.won}</td>
                    <td>{s.drawn}</td>
                    <td>{s.lost}</td>
                    <td>{s.goalsFor}</td>
                    <td>{s.goalsAgainst}</td>
                    <td className="predictions-template__pts-cell">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )}

    {groups.length > 0 ? (
      <GroupPredictionForm
        groups={groups}
        onSubmit={onSubmit}
        existingBets={existingGroupBets}
        isDisabled={isDisabled}
      />
    ) : (
      <div className="predictions-template__empty">
        <Typography variant="body">
          {locale === 'en'
            ? 'Group predictions will be available once groups are confirmed.'
            : 'Las predicciones de grupos estarán disponibles una vez confirmados los grupos.'}
        </Typography>
      </div>
    )}
  </>
);
