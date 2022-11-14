import clone from 'just-clone';

import { defaultGroupsStats } from '@/store/groupsStats';
import {
  Countries,
  GroupStageValues,
  GroupOrdered,
  GroupsNames,
  GroupStats,
  Matches,
  Stats,
  GroupsStats,
} from '@/types';

export const calculateGroup = (
  groupName: GroupsNames,
  matches: Matches,
  values: GroupStageValues,
) => {
  const group = clone(defaultGroupsStats[groupName]);
  matches.forEach((matchInfo) => {
    const { match } = matchInfo;
    const [team1, team2] = match.split('-');
    const scoreTeam1 = values[groupName][match]?.[team1 as Countries] as number;
    const scoreTeam2 = values[groupName][match]?.[team2 as Countries] as number;
    if (
      scoreTeam1 === undefined ||
      Number.isNaN(scoreTeam1) ||
      scoreTeam2 === undefined ||
      Number.isNaN(scoreTeam2)
    ) {
      return;
    }
    const team1Stats = group[team1 as Countries] as Stats;
    // eslint-disable-next-line no-nested-ternary
    team1Stats.pts += scoreTeam1 > scoreTeam2 ? 3 : scoreTeam1 === scoreTeam2 ? 1 : 0;
    team1Stats.gf += scoreTeam1;
    team1Stats.ga += scoreTeam2;
    team1Stats.gd = team1Stats.gf - team1Stats.ga;
    const team2Stats = group[team2 as Countries] as Stats;
    // eslint-disable-next-line no-nested-ternary
    team2Stats.pts += scoreTeam2 > scoreTeam1 ? 3 : scoreTeam1 === scoreTeam2 ? 1 : 0;
    team2Stats.gf += scoreTeam2;
    team2Stats.ga += scoreTeam1;
    team2Stats.gd = team2Stats.gf - team2Stats.ga;
  });
  return group;
};

const calculatePosition = (a: [string, Stats], b: [string, Stats]) => {
  if (a[1].pts > b[1].pts) return -1;
  if (a[1].pts < b[1].pts) return 1;
  if (a[1].gd > b[1].gd) return -1;
  if (a[1].gd < b[1].gd) return 1;
  if (a[1].gf > b[1].gf) return -1;
  if (a[1].gf < b[1].gf) return 1;
  return 0;
};

export const calculateOrderGroup = (group: GroupStats) => {
  const groupArrayOrdered = Object.entries(group).sort(calculatePosition);
  const groupOrdered: GroupOrdered = groupArrayOrdered.map(([key, value]) => ({ [key]: value }));
  return groupOrdered;
};

export const isGroupStatsOk = (stats: GroupsStats) => {
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const group in stats) {
    const zeroPointsTeams = [];
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const team in stats[group as GroupsNames]) {
      if (stats[group as GroupsNames][team as Countries]?.pts === 0) zeroPointsTeams.push(team);
    }
    if (zeroPointsTeams.length > 1) return false;
  }
  return true;
};
