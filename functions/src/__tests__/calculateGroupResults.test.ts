import { describe, expect, it } from 'vitest';

import { scoreGroupBet } from '../calculateGroupResults';

import './setup';

const standings = [
  {
    teamId: 'ARG',
    position: 1,
    played: 3,
    won: 3,
    drawn: 0,
    lost: 0,
    goalsFor: 7,
    goalsAgainst: 1,
    goalDifference: 6,
    points: 9,
  },
  {
    teamId: 'BRA',
    position: 2,
    played: 3,
    won: 2,
    drawn: 0,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 3,
    goalDifference: 2,
    points: 6,
  },
  {
    teamId: 'MEX',
    position: 3,
    played: 3,
    won: 1,
    drawn: 0,
    lost: 2,
    goalsFor: 3,
    goalsAgainst: 4,
    goalDifference: -1,
    points: 3,
  },
  {
    teamId: 'CHI',
    position: 4,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 3,
    goalsFor: 1,
    goalsAgainst: 8,
    goalDifference: -7,
    points: 0,
  },
];

const allGroupStandings = { 'group-a': standings };

describe('scoreGroupBet with classifiedTeamIds', () => {
  describe('exact position matches', () => {
    it('all 3 positions exact → 9 points (3+3+3)', () => {
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(9);
      expect(result.exactMatches).toBe(3);
    });

    it('only position 0 exact → 3 points', () => {
      const result = scoreGroupBet(
        ['ARG', 'MEX', 'BRA', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(5);
      expect(result.exactMatches).toBe(1);
    });
  });

  describe('qualified but wrong position (Option B)', () => {
    it('top 2 swapped, 3rd wrong → 2 points (1+1)', () => {
      const customStandings = [
        {
          teamId: 'ARG',
          position: 1,
          played: 3,
          won: 3,
          drawn: 0,
          lost: 0,
          goalsFor: 7,
          goalsAgainst: 1,
          goalDifference: 6,
          points: 9,
        },
        {
          teamId: 'BRA',
          position: 2,
          played: 3,
          won: 2,
          drawn: 0,
          lost: 1,
          goalsFor: 5,
          goalsAgainst: 3,
          goalDifference: 2,
          points: 6,
        },
        {
          teamId: 'USA',
          position: 3,
          played: 3,
          won: 1,
          drawn: 0,
          lost: 2,
          goalsFor: 3,
          goalsAgainst: 4,
          goalDifference: -1,
          points: 3,
        },
        {
          teamId: 'CHI',
          position: 4,
          played: 3,
          won: 0,
          drawn: 0,
          lost: 3,
          goalsFor: 1,
          goalsAgainst: 8,
          goalDifference: -7,
          points: 0,
        },
      ];
      const allStandings = { 'group-a': customStandings };
      const result = scoreGroupBet(
        ['BRA', 'ARG', 'GER', 'CHI'],
        customStandings,
        'all',
        allStandings,
        ['ARG', 'BRA', 'GER'],
      );
      expect(result.points).toBe(2);
      expect(result.wrongPositionMatches).toBe(2);
    });

    it('1st correct, 2nd wrong but qualified → 5 points (3+1+1)', () => {
      const result = scoreGroupBet(
        ['ARG', 'MEX', 'BRA', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(5);
      expect(result.exactMatches).toBe(1);
      expect(result.wrongPositionMatches).toBe(2);
    });
  });

  describe('position 3 (3rd place) scoring', () => {
    it('3rd exact → 3 points', () => {
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(9);
    });

    it('3rd exact match in standings scores 3 points even without classifiedTeamIds entry (Option B)', () => {
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA'],
      );
      expect(result.points).toBe(9);
      expect(result.exactMatches).toBe(3);
    });
  });

  describe('Option B fairness: top-3 prediction always counts as classified', () => {
    it('predictor put MEX 3rd, MEX actually 2nd (qualified but wrong position), MEX not in classifiedTeamIds → still 1 point', () => {
      const customStandings = [
        {
          teamId: 'ARG',
          position: 1,
          played: 3,
          won: 3,
          drawn: 0,
          lost: 0,
          goalsFor: 7,
          goalsAgainst: 1,
          goalDifference: 6,
          points: 9,
        },
        {
          teamId: 'MEX',
          position: 2,
          played: 3,
          won: 2,
          drawn: 0,
          lost: 1,
          goalsFor: 5,
          goalsAgainst: 3,
          goalDifference: 2,
          points: 6,
        },
        {
          teamId: 'BRA',
          position: 3,
          played: 3,
          won: 1,
          drawn: 0,
          lost: 2,
          goalsFor: 3,
          goalsAgainst: 4,
          goalDifference: -1,
          points: 3,
        },
        {
          teamId: 'CHI',
          position: 4,
          played: 3,
          won: 0,
          drawn: 0,
          lost: 3,
          goalsFor: 1,
          goalsAgainst: 8,
          goalDifference: -7,
          points: 0,
        },
      ];
      const allStandings = { 'group-a': customStandings };
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        customStandings,
        'all',
        allStandings,
        ['ARG', 'BRA'],
      );
      expect(result.points).toBe(5);
      expect(result.exactMatches).toBe(1);
      expect(result.wrongPositionMatches).toBe(2);
    });

    it('team not predicted in top 3 at all, but actually classifies → 0 points', () => {
      const result = scoreGroupBet(
        ['USA', 'ENG', 'GER', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['USA', 'ENG', 'GER'],
      );
      expect(result.points).toBe(0);
    });
  });

  describe('4th place never scores', () => {
    it('4th position prediction → 0 points regardless of team', () => {
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        standings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('awards 0 points for completely wrong prediction', () => {
      const result = scoreGroupBet(
        ['USA', 'ENG', 'GER', 'FRA'],
        standings,
        'all',
        allGroupStandings,
        ['USA', 'ENG', 'GER'],
      );
      expect(result.points).toBe(0);
      expect(result.exactMatches).toBe(0);
      expect(result.wrongPositionMatches).toBe(0);
    });

    it('handles empty positions array', () => {
      const result = scoreGroupBet([], standings, 'all', allGroupStandings, []);
      expect(result).toEqual({
        points: 0,
        exactMatches: 0,
        wrongPositionMatches: 0,
        exactQualified: 0,
      });
    });

    it('handles empty standings array', () => {
      const result = scoreGroupBet(['ARG', 'BRA', 'MEX', 'CHI'], [], 'all', allGroupStandings, [
        'ARG',
        'BRA',
        'MEX',
      ]);
      expect(result).toEqual({
        points: 0,
        exactMatches: 0,
        wrongPositionMatches: 0,
        exactQualified: 0,
      });
    });

    it('is case-insensitive: uppercase predictions vs lowercase standings', () => {
      const lowercaseStandings = standings.map((s) => ({ ...s, teamId: s.teamId.toLowerCase() }));
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        lowercaseStandings,
        'all',
        allGroupStandings,
        ['ARG', 'BRA', 'MEX'],
      );
      expect(result.points).toBe(9);
      expect(result.exactMatches).toBe(3);
    });

    it('is case-insensitive: lowercase predictions vs uppercase standings', () => {
      const result = scoreGroupBet(
        ['arg', 'bra', 'mex', 'chi'],
        standings,
        'all',
        allGroupStandings,
        ['arg', 'bra', 'mex'],
      );
      expect(result.points).toBe(9);
    });

    it('default empty classifiedTeamIds still works (backward compat)', () => {
      const result = scoreGroupBet(
        ['ARG', 'BRA', 'MEX', 'CHI'],
        standings,
        'all',
        allGroupStandings,
      );
      expect(result.points).toBe(9);
    });
  });
});
