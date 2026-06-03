import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import { SCORING } from './scoring';

const db = admin.firestore();

interface MatchData {
  slug: string;
  phase: string;
  groupId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  result: { home: number | null; away: number | null };
  status: string;
  pointsCalculated?: boolean;
}

interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function computeStandings(
  matches: {
    homeTeamId: string | null;
    awayTeamId: string | null;
    result: { home: number | null; away: number | null };
  }[],
): TeamStanding[] {
  const teams = new Map<string, TeamStanding>();

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) continue;
    if (match.result.home === null || match.result.away === null) continue;

    const homeId = match.homeTeamId;
    const awayId = match.awayTeamId;
    const homeGoals = match.result.home;
    const awayGoals = match.result.away;

    if (!teams.has(homeId)) {
      teams.set(homeId, {
        teamId: homeId,
        position: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }

    if (!teams.has(awayId)) {
      teams.set(awayId, {
        teamId: awayId,
        position: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }

    const home = teams.get(homeId)!;
    const away = teams.get(awayId)!;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won += 1;
      home.points += SCORING.GROUP.WIN;
      away.lost += 1;
    } else if (homeGoals < awayGoals) {
      away.won += 1;
      away.points += SCORING.GROUP.WIN;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += SCORING.GROUP.DRAW;
      away.points += SCORING.GROUP.DRAW;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  const standings = Array.from(teams.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });

  standings.forEach((team, index) => {
    team.position = index + 1;
  });

  return standings;
}

export const updateGroupStandings = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as MatchData;
    const after = change.after.data() as MatchData;

    if (!after.pointsCalculated || before.pointsCalculated) {
      return null;
    }

    if (!after.groupId || after.phase !== 'group') {
      return null;
    }

    const tournamentId = context.params.tournamentId;
    const groupId = after.groupId;

    functions.logger.log(`Updating standings for ${tournamentId}/${groupId}`);

    const matchesSnapshot = await db
      .collection(`tournaments/${tournamentId}/matches`)
      .where('groupId', '==', groupId)
      .where('status', '==', 'finished')
      .get();

    const matches = matchesSnapshot.docs.map((doc) => doc.data() as MatchData);

    const standings = computeStandings(matches);

    await db.collection(`tournaments/${tournamentId}/group_standings`).doc(groupId).set(
      {
        groupId,
        lastUpdated: FieldValue.serverTimestamp(),
        standings,
      },
      { merge: true },
    );

    functions.logger.log(
      `Updated standings for ${groupId}: ${standings.map((t) => `${t.teamId}=${t.points}`).join(', ')}`,
    );

    return null;
  });
