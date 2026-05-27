import { describe, expect, it } from 'vitest';

import type { MatchWithId } from '../predictions-flow';
import { calculateGroupStandings } from '../predictions-flow';

const makeMatch = (id: string, groupId: string, home: string, away: string): MatchWithId => ({
  id,
  slug: id,
  groupId,
  phase: 'group',
  homeTeamId: home,
  awayTeamId: away,
  date: { toDate: () => new Date() } as MatchWithId['date'],
  stadium: 'Test Stadium',
  result: { home: null, away: null },
  status: 'scheduled',
  predictionDeadline: { toDate: () => new Date() } as MatchWithId['predictionDeadline'],
  createdAt: { toDate: () => new Date() } as MatchWithId['createdAt'],
  updatedAt: { toDate: () => new Date() } as MatchWithId['updatedAt'],
});

const teamsMap = {
  arg: { fifaCode: 'ARG', name: 'Argentina' },
  bra: { fifaCode: 'BRA', name: 'Brazil' },
  ger: { fifaCode: 'GER', name: 'Germany' },
  fra: { fifaCode: 'FRA', name: 'France' },
};

const groupAMatches: MatchWithId[] = [
  makeMatch('m1', 'A', 'arg', 'bra'),
  makeMatch('m2', 'A', 'ger', 'fra'),
  makeMatch('m3', 'A', 'arg', 'ger'),
  makeMatch('m4', 'A', 'bra', 'fra'),
  makeMatch('m5', 'A', 'arg', 'fra'),
  makeMatch('m6', 'A', 'bra', 'ger'),
];

const predictions = {
  m1: { home: 2, away: 1 },
  m2: { home: 1, away: 1 },
  m3: { home: 3, away: 0 },
  m4: { home: 0, away: 2 },
  m5: { home: 1, away: 0 },
  m6: { home: 2, away: 2 },
};

interface Standing {
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

const oldCalculatePredictedStandings = (
  matches: MatchWithId[],
  preds: Record<string, { home?: number; away?: number }>,
  tMap: Record<string, { fifaCode: string; name: string }>,
): Record<string, Standing[]> => {
  const groupStandings: Record<string, Record<string, Standing>> = {};
  for (const match of matches) {
    const pred = preds[match.id];
    if (!pred || pred.home == null || pred.away == null) continue;
    if (!match.homeTeamId || !match.awayTeamId) continue;
    const groupId = match.groupId || 'unknown';
    if (!groupStandings[groupId]) groupStandings[groupId] = {};
    const initTeam = (teamId: string) => {
      if (!groupStandings[groupId][teamId]) {
        const team = tMap[teamId] || { fifaCode: teamId.toUpperCase(), name: teamId };
        groupStandings[groupId][teamId] = {
          teamId,
          fifaCode: team.fifaCode,
          name: team.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }
    };
    initTeam(match.homeTeamId);
    initTeam(match.awayTeamId);
    const home = groupStandings[groupId][match.homeTeamId];
    const away = groupStandings[groupId][match.awayTeamId];
    home.played++;
    away.played++;
    home.goalsFor += pred.home;
    home.goalsAgainst += pred.away;
    away.goalsFor += pred.away;
    away.goalsAgainst += pred.home;
    if (pred.home > pred.away) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (pred.home < pred.away) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }
  const result: Record<string, Standing[]> = {};
  for (const [groupId, teams] of Object.entries(groupStandings)) {
    result[groupId] = (Object.values(teams) as Standing[]).sort(
      (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
    );
  }
  return result;
};

describe('calculatePredictedStandings snapshot', () => {
  it('new per-group helper produces byte-identical output to old implementation', () => {
    const oldResult = oldCalculatePredictedStandings(groupAMatches, predictions, teamsMap);
    const newResult = { A: calculateGroupStandings(groupAMatches, predictions, teamsMap, 'A') };

    expect(JSON.stringify(newResult)).toBe(JSON.stringify(oldResult));
  });

  it('matches empty predictions', () => {
    const oldResult = oldCalculatePredictedStandings(groupAMatches, {}, teamsMap);
    const newStandings = calculateGroupStandings(groupAMatches, {}, teamsMap, 'A');
    const newResult = newStandings.length > 0 ? { A: newStandings } : {};
    expect(JSON.stringify(newResult)).toBe(JSON.stringify(oldResult));
  });

  it('matches partial predictions', () => {
    const partial = { m1: { home: 2, away: 1 } };
    const oldResult = oldCalculatePredictedStandings(groupAMatches, partial, teamsMap);
    const newResult = { A: calculateGroupStandings(groupAMatches, partial, teamsMap, 'A') };
    expect(JSON.stringify(newResult)).toBe(JSON.stringify(oldResult));
  });

  it('matches with multiple groups', () => {
    const groupBMatches: MatchWithId[] = [
      makeMatch('m7', 'B', 'arg', 'bra'),
      makeMatch('m8', 'B', 'ger', 'fra'),
    ];
    const allMatches = [...groupAMatches, ...groupBMatches];
    const allPredictions = { ...predictions, m7: { home: 1, away: 0 }, m8: { home: 0, away: 3 } };

    const oldResult = oldCalculatePredictedStandings(allMatches, allPredictions, teamsMap);
    const newResult = {
      A: calculateGroupStandings(allMatches, allPredictions, teamsMap, 'A'),
      B: calculateGroupStandings(allMatches, allPredictions, teamsMap, 'B'),
    };

    expect(JSON.stringify(newResult)).toBe(JSON.stringify(oldResult));
  });
});
