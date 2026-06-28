import { describe, expect, it } from 'vitest';

import type { TeamStanding } from '@app-types/firestore';

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
  ['ger', 'GER'],
  ['fra', 'FRA'],
]);

function makeStanding(teamId: string, position: number, points = 0, gd = 0, gf = 0): TeamStanding {
  return {
    teamId,
    position,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: gf,
    goalsAgainst: 0,
    goalDifference: gd,
    points,
  };
}

const baseResults = (over: Partial<PredictionResults> = {}): PredictionResults => ({
  teams,
  groupStandings: new Map(),
  groupNames: new Map([
    ['a', 'Group A'],
    ['b', 'Group B'],
  ]),
  finalStandings: null,
  bestPlayers: null,
  groupPointsCalculated: new Map(),
  isThirdPlaceDecided: false,
  ...over,
});

describe('buildGroupPredictions', () => {
  it('colors each slot by exact-position match and sorts groups by id', () => {
    // 2 groups with 8 teams total to allow computing best 8 third-place
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('rsa', 3, 3, 0, 2),
            makeStanding('kor', 4, 0, -7, 0),
          ],
        ],
        [
          'b',
          [
            makeStanding('bra', 1, 9, 6, 6),
            makeStanding('arg', 2, 6, 1, 4),
            makeStanding('ger', 3, 3, -1, 2),
            makeStanding('fra', 4, 0, -6, 0),
          ],
        ],
      ]),
      groupPointsCalculated: new Map([
        ['a', true],
        ['b', true],
      ]),
      isThirdPlaceDecided: true,
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
    expect(groupA.label).toBe('Grupo A');
    expect(groupA.teams.map((t) => t.fifaCode)).toEqual(['MEX', 'RSA', 'USA', 'KOR']);
    // actual: mex(1st), usa(2nd), rsa(3rd), kor(4th)
    // predicted: mex(1st), rsa(2nd), usa(3rd), kor(4th)
    // slot1 mex ✓ exact
    // slot2 rsa ✗ wrong (predicted 2nd but actual 3rd; qualifies via best 8 third-place → partial)
    // slot3 usa ✗ wrong (predicted 3rd but actual 2nd; qualifies top 2, wrong slot → partial)
    // slot4 kor ✓ exact → null (4th position never colored)
    expect(groupA.teams.map((t) => t.correct)).toEqual([true, 'partial', 'partial', null]);
  });

  it('leaves correctness null when a group has no standings yet', () => {
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'usa'] }],
      baseResults(),
      'en',
    );
    expect(views[0].label).toBe('Group A');
    expect(views[0].teams.map((t) => t.correct)).toEqual([null, null]);
  });

  it('marks as partial when team qualifies (top 2) but in wrong position', () => {
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('rsa', 3, 3, 0, 2),
            makeStanding('kor', 4, 0, -7, 0),
          ],
        ],
        [
          'b',
          [
            makeStanding('bra', 1, 9, 6, 6),
            makeStanding('arg', 2, 6, 1, 4),
            makeStanding('ger', 3, 3, -1, 2),
            makeStanding('fra', 4, 0, -6, 0),
          ],
        ],
      ]),
      groupPointsCalculated: new Map([
        ['a', true],
        ['b', true],
      ]),
      isThirdPlaceDecided: true,
    });
    // Predict usa, mex in slots 1-2 but they actually finish 2nd and 1st (swapped)
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['usa', 'mex', 'rsa', 'kor'] }],
      results,
      'en',
    );
    // usa: predicted 1st, actual 2nd → qualifies but wrong slot → partial
    // mex: predicted 2nd, actual 1st → qualifies but wrong slot → partial
    // rsa: predicted 3rd, actual 3rd → exact (correct slot)
    // kor: predicted 4th, actual 4th → null (4th position never colored)
    expect(views[0].teams.map((t) => t.correct)).toEqual(['partial', 'partial', true, null]);
  });

  it('marks as true when the predicted 3rd-place team actually finishes 3rd', () => {
    // rsa has 3pts with GD 0, ger has 3pts with GD -1, so rsa qualifies as best 3rd
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('rsa', 3, 3, 0, 2),
            makeStanding('kor', 4, 0, -7, 0),
          ],
        ],
        [
          'b',
          [
            makeStanding('bra', 1, 9, 6, 6),
            makeStanding('arg', 2, 6, 1, 4),
            makeStanding('ger', 3, 3, -1, 2),
            makeStanding('fra', 4, 0, -6, 0),
          ],
        ],
      ]),
      groupPointsCalculated: new Map([
        ['a', true],
        ['b', true],
      ]),
      isThirdPlaceDecided: true,
    });
    // Predict rsa 3rd, kor 4th - rsa actually finishes 3rd (exact slot match)
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'usa', 'rsa', 'kor'] }],
      results,
      'en',
    );
    // mex: predicted 1st, actual 1st → exact
    // usa: predicted 2nd, actual 2nd → exact
    // rsa: predicted 3rd, actual 3rd → exact (correct slot, regardless of best-8 status)
    // kor: predicted 4th, actual 4th → null (4th position never colored)
    expect(views[0].teams.map((t) => t.correct)).toEqual([true, true, true, null]);
  });

  it('marks as partial when the predicted 3rd-place team actually finishes 1st or 2nd', () => {
    // User predicted 3rd in Group A, but the team qualified via top 2 in the wrong slot
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('rsa', 3, 3, 0, 2),
            makeStanding('kor', 4, 0, -7, 0),
          ],
        ],
        [
          'b',
          [
            makeStanding('bra', 1, 9, 6, 6),
            makeStanding('arg', 2, 6, 1, 4),
            makeStanding('ger', 3, 3, -1, 2),
            makeStanding('fra', 4, 0, -6, 0),
          ],
        ],
      ]),
      groupPointsCalculated: new Map([
        ['a', true],
        ['b', true],
      ]),
      isThirdPlaceDecided: true,
    });
    // Predict usa 3rd, but usa actually finishes 2nd in this group (qualified, wrong slot)
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'rsa', 'usa', 'kor'] }],
      results,
      'en',
    );
    // mex: predicted 1st, actual 1st → exact
    // rsa: predicted 2nd, actual 3rd → partial (qualified via best 8 thirds)
    // usa: predicted 3rd, actual 2nd → partial (qualified top 2, wrong slot)
    // kor: predicted 4th, actual 4th → null
    expect(views[0].teams.map((t) => t.correct)).toEqual([true, 'partial', 'partial', null]);
  });

  it('marks as true when the predicted 3rd-place team classified (finished 3rd AND made top 8)', () => {
    // rsa: 3pts GD 0 GF 2 → only 3rd-place candidate, ranks #1 in best-8 list → classified
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('rsa', 3, 3, 0, 2),
            makeStanding('kor', 4, 0, -7, 0),
          ],
        ],
      ]),
      groupPointsCalculated: new Map([['a', true]]),
      isThirdPlaceDecided: true,
    });
    // Predict rsa 3rd; rsa finished 3rd and is the only 3rd-place team, so it classifies
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'usa', 'rsa', 'kor'] }],
      results,
      'en',
    );
    // rsa: predicted 3rd, actual 3rd, in top 8 thirds → exact (classified)
    expect(views[0].teams[2].correct).toBe(true);
  });

  it('marks as false when the predicted 3rd-place team did not classify (finished 3rd but missed top 8)', () => {
    // Eight 3rd-place teams with better records push kor out of the top 8.
    // kor's group: 3pts, GD -7, GF 0 — worst possible 3rd-place record.
    const results = baseResults({
      groupStandings: new Map<string, TeamStanding[]>([
        [
          'a',
          [
            makeStanding('mex', 1, 9, 5, 5),
            makeStanding('usa', 2, 6, 2, 3),
            makeStanding('kor', 3, 3, -7, 0),
            makeStanding('rsa', 4, 0, -8, 0),
          ],
        ],
        // Eight groups where the 3rd-place team outranks kor on every tiebreaker.
        ...Array.from({ length: 8 }, (_, i) => {
          const id = String.fromCharCode(98 + i);
          return [
            id,
            [
              makeStanding(`${id}1`, 1, 9, 5, 5),
              makeStanding(`${id}2`, 2, 6, 2, 3),
              makeStanding(`${id}3`, 3, 3, 0, 2),
              makeStanding(`${id}4`, 4, 0, -7, 0),
            ],
          ] as [string, TeamStanding[]];
        }),
      ]),
      groupPointsCalculated: new Map(
        Array.from({ length: 9 }, (_, i) => {
          const id = i === 0 ? 'a' : String.fromCharCode(98 + i - 1);
          return [id, true];
        }),
      ),
      isThirdPlaceDecided: true,
    });
    // Predict kor 3rd; kor finished 3rd in group A but does NOT make the top 8.
    const views = buildGroupPredictions(
      [{ groupId: 'a', positions: ['mex', 'usa', 'kor', 'rsa'] }],
      results,
      'en',
    );
    // kor: predicted 3rd, actual 3rd, but NOT in top 8 thirds → not classified → false
    expect(views[0].teams[2].correct).toBe(false);
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
