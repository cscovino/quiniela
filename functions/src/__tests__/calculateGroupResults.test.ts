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

describe('scoreGroupBet', () => {
  describe('position 3 (4th place) never scores', () => {
    it('4th place exact = 0 points', () => {
      const result = scoreGroupBet(['USA', 'ENG', 'GER', 'CHI'], standings);
      expect(result.points).toBe(0);
    });

    it('4th place qualified = 0 points even if team is somewhere else in group', () => {
      const result = scoreGroupBet(['BRA', 'MEX', 'CHI', 'ARG'], standings);
      expect(result.points).toBe(2); // BRA qualified wrong pos=1, MEX qualified wrong pos=1, CHI 4th=0, ARG pos3=0
    });

    it('position 3 is ignored even if predicted as 3rd place exact', () => {
      const result = scoreGroupBet(['ARG', 'BRA', 'CHI', 'MEX'], standings);
      expect(result.points).toBe(6); // 3 (ARG exact) + 3 (BRA exact) + 0 (MEX 3rd not qualified) + 0 (CHI 4th)
      expect(result.exactMatches).toBe(2); // ARG, BRA
    });
  });

  describe('positions 0 and 1 always qualify', () => {
    it('exact 1st position = 3 points', () => {
      const result = scoreGroupBet(['ARG', 'BRA', 'MEX', 'CHI'], standings);
      expect(result.points).toBe(9); // 3 + 3 + 3 (MEX 3rd qualified) + 0
      expect(result.exactMatches).toBe(3); // ARG, BRA, MEX
    });

    it('1st/2nd swapped = 5 points (1 exact + 2 qualified wrong position)', () => {
      const result = scoreGroupBet(['BRA', 'ARG', 'MEX', 'CHI'], standings);
      expect(result.points).toBe(5); // BRA wrong pos0=1pt, ARG wrong pos1=1pt, MEX exact pos2=3pts, CHI 4th=0
      expect(result.exactMatches).toBe(1); // MEX
      expect(result.wrongPositionMatches).toBe(2); // BRA, ARG qualified but wrong position
    });
  });

  describe('position 2 (3rd place) scores only if qualified via matrix', () => {
    it('3rd place exact = 3 points when qualified', () => {
      const allGroupStandings = { 'group-a': standings };
      const result = scoreGroupBet(['ARG', 'BRA', 'MEX', 'CHI'], standings, allGroupStandings);
      expect(result.points).toBe(9); // 3 + 3 + 3 + 0
      expect(result.exactMatches).toBe(3);
    });

    it('3rd place not qualified via matrix = 0 points', () => {
      const otherGroupStandings = {
        'group-a': standings,
        'group-b': [
          {
            teamId: 'X',
            position: 1,
            played: 3,
            won: 3,
            drawn: 0,
            lost: 0,
            goalsFor: 9,
            goalsAgainst: 0,
            goalDifference: 9,
            points: 9,
          },
          {
            teamId: 'Y',
            position: 2,
            played: 3,
            won: 2,
            drawn: 0,
            lost: 1,
            goalsFor: 4,
            goalsAgainst: 2,
            goalDifference: 2,
            points: 6,
          },
          {
            teamId: 'Z',
            position: 3,
            played: 3,
            won: 1,
            drawn: 0,
            lost: 2,
            goalsFor: 2,
            goalsAgainst: 5,
            goalDifference: -3,
            points: 3,
          },
          {
            teamId: 'W',
            position: 4,
            played: 3,
            won: 0,
            drawn: 0,
            lost: 3,
            goalsFor: 0,
            goalsAgainst: 9,
            goalDifference: -9,
            points: 0,
          },
        ],
      };
      const result = scoreGroupBet(['ARG', 'BRA', 'FRA', 'CHI'], standings, otherGroupStandings);
      expect(result.points).toBe(6); // 3 (ARG exact) + 3 (BRA exact) + 0 (FRA not qualified) + 0 (CHI 4th)
      expect(result.exactMatches).toBe(2); // ARG, BRA
    });
  });

  it('awards 0 points for completely wrong prediction', () => {
    const result = scoreGroupBet(['USA', 'ENG', 'GER', 'FRA'], standings);
    expect(result.points).toBe(0);
    expect(result.exactMatches).toBe(0);
    expect(result.wrongPositionMatches).toBe(0);
    expect(result.exactQualified).toBe(0);
  });

  it('handles empty positions array', () => {
    const result = scoreGroupBet([], standings);
    expect(result).toEqual({
      points: 0,
      exactMatches: 0,
      wrongPositionMatches: 0,
      exactQualified: 0,
    });
  });

  it('handles empty standings array', () => {
    const positions = ['ARG', 'BRA', 'MEX', 'CHI'];
    const result = scoreGroupBet(positions, []);
    expect(result).toEqual({
      points: 0,
      exactMatches: 0,
      wrongPositionMatches: 0,
      exactQualified: 0,
    });
  });

  it('is case-insensitive: uppercase predictions vs lowercase standings', () => {
    const lowercaseStandings = standings.map((s) => ({ ...s, teamId: s.teamId.toLowerCase() }));
    const result = scoreGroupBet(['ARG', 'BRA', 'MEX', 'CHI'], lowercaseStandings);
    expect(result.points).toBe(9); // 3+3+3+0
    expect(result.exactMatches).toBe(3);
  });

  it('is case-insensitive: lowercase predictions vs uppercase standings', () => {
    const result = scoreGroupBet(['arg', 'bra', 'mex', 'chi'], standings);
    expect(result.points).toBe(9);
    expect(result.exactMatches).toBe(3);
  });
});
