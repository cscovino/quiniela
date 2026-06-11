import { describe, expect, it } from 'vitest';

import {
  buildBestPlayersPrediction,
  buildFinalPhasePrediction,
  buildGroupPredictions,
  type PredictionResults,
} from '../predictor-predictions';

const teams = new Map<string, string>([
  ['mex', 'MEX'],
  ['usa', 'USA'],
  ['rsa', 'RSA'],
  ['kor', 'KOR'],
  ['bra', 'BRA'],
  ['arg', 'ARG'],
]);

const baseResults = (over: Partial<PredictionResults> = {}): PredictionResults => ({
  teams,
  groupStandings: new Map(),
  groupNames: new Map([
    ['a', 'Group A'],
    ['b', 'Group B'],
  ]),
  finalStandings: null,
  bestPlayers: null,
  ...over,
});

describe('buildGroupPredictions', () => {
  it('colors each slot by exact-position match and sorts groups by id', () => {
    const results = baseResults({
      groupStandings: new Map([['a', ['mex', 'usa', 'rsa', 'kor']]]),
    });
    const views = buildGroupPredictions(
      [
        { groupId: 'b', positions: ['bra', 'arg'] },
        { groupId: 'a', positions: ['mex', 'rsa', 'usa', 'kor'] },
      ],
      results,
      'es',
    );

    expect(views.map((v) => v.groupId)).toEqual(['a', 'b']);

    const groupA = views[0];
    expect(groupA.label).toBe('Grupo A'); // localized
    expect(groupA.teams.map((t) => t.fifaCode)).toEqual(['MEX', 'RSA', 'USA', 'KOR']);
    // actual order is mex,usa,rsa,kor → slot1 mex ✓, slot2 rsa ✗, slot3 usa ✗, slot4 kor ✓
    expect(groupA.teams.map((t) => t.correct)).toEqual([true, false, false, true]);
  });

  it('leaves correctness null when a group has no standings yet', () => {
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'usa'] }],
      baseResults(),
      'en',
    );
    expect(views[0].label).toBe('Group A'); // not localized in en
    expect(views[0].teams.map((t) => t.correct)).toEqual([null, null]);
  });
});

describe('buildFinalPhasePrediction', () => {
  const predicted = { first: 'arg', second: 'bra', third: 'mex', fourth: 'usa' };

  it('returns null for a missing prediction', () => {
    expect(buildFinalPhasePrediction(undefined, baseResults())).toBeNull();
  });

  it('colors each slot by exact match against final standings', () => {
    const results = baseResults({
      finalStandings: { first: 'arg', second: 'mex', third: 'bra', fourth: 'usa' },
    });
    const view = buildFinalPhasePrediction(predicted, results)!;
    expect(view.positions.map((p) => p.fifaCode)).toEqual(['ARG', 'BRA', 'MEX', 'USA']);
    // arg✓, bra(pred 2nd) vs mex ✗, mex(pred 3rd) vs bra ✗, usa✓
    expect(view.positions.map((p) => p.correct)).toEqual([true, false, false, true]);
  });

  it('leaves correctness null until the final standings exist', () => {
    const view = buildFinalPhasePrediction(predicted, baseResults())!;
    expect(view.positions.every((p) => p.correct === null)).toBe(true);
  });
});

describe('buildBestPlayersPrediction', () => {
  it('returns null for a missing prediction', () => {
    expect(buildBestPlayersPrediction(null, baseResults())).toBeNull();
  });

  it('matches names case-insensitively against the result', () => {
    const results = baseResults({
      bestPlayers: { topScorer: 'Lionel Messi', bestGoalkeeper: 'Emi Martinez' },
    });
    const view = buildBestPlayersPrediction(
      { bestScorer: '  lionel messi ', bestGoalkeeper: 'Someone Else' },
      results,
    )!;
    expect(view.scorer.correct).toBe(true);
    expect(view.goalkeeper.correct).toBe(false);
  });

  it('fuzzy-matches like the server (contains, diacritics, surname fallback)', () => {
    const results = baseResults({
      bestPlayers: { topScorer: 'Lionel Messi', bestGoalkeeper: 'Emiliano Martínez' },
    });

    // Predicted "Messi" is contained in the actual "Lionel Messi".
    // Predicted "E. Martinez": diacritics stripped + surname "martinez" matches.
    const view = buildBestPlayersPrediction(
      { bestScorer: 'Messi', bestGoalkeeper: 'E. Martinez' },
      results,
    )!;
    expect(view.scorer.correct).toBe(true);
    expect(view.goalkeeper.correct).toBe(true);
  });

  it('does not match on a too-short shared surname token', () => {
    const results = baseResults({
      bestPlayers: { topScorer: 'Heung-min Son', bestGoalkeeper: 'X' },
    });
    // Surnames "son" (3 chars) only match via the >2 rule when equal; a
    // different surname must not match.
    const view = buildBestPlayersPrediction(
      { bestScorer: 'Kevin De Bruyne', bestGoalkeeper: 'Y' },
      results,
    )!;
    expect(view.scorer.correct).toBe(false);
  });

  it('leaves correctness null until the result is published', () => {
    const view = buildBestPlayersPrediction(
      { bestScorer: 'X', bestGoalkeeper: 'Y' },
      baseResults(),
    )!;
    expect(view.scorer.correct).toBeNull();
    expect(view.goalkeeper.correct).toBeNull();
  });
});
