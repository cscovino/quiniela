import { Timestamp } from 'firebase/firestore';

export type Countries =
  | 'QAT'
  | 'ECU'
  | 'SEN'
  | 'NED'
  | 'ENG'
  | 'IRN'
  | 'USA'
  | 'WAL'
  | 'ARG'
  | 'KSA'
  | 'MEX'
  | 'POL'
  | 'FRA'
  | 'AUS'
  | 'DEN'
  | 'TUN'
  | 'ESP'
  | 'CRC'
  | 'GER'
  | 'JPN'
  | 'BEL'
  | 'CAN'
  | 'MAR'
  | 'CRO'
  | 'BRA'
  | 'SRB'
  | 'SUI'
  | 'CMR'
  | 'POR'
  | 'GHA'
  | 'URU'
  | 'KOR';

export type GroupsNames = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type Match = `${Countries}-${Countries}`;

export type MatchInfo = {
  match: Match;
  date: Timestamp;
};

export type Matches = Array<MatchInfo>;

export type Stats = {
  pts: number;
  gf: number;
  ga: number;
  gd: number;
};

export type TeamsStats = {
  [Key in Countries]: Stats;
};

export type GroupInfo = {
  matches: Matches;
  teams: Array<Countries>;
};

export type Groups = {
  [Key in GroupsNames]: GroupInfo;
};

export type Group = Partial<Groups>;

export type GroupStats = Partial<TeamsStats>;

export type GroupOrdered = Array<GroupStats>;

export type GroupsOrdered = {
  [Key in GroupsNames]: GroupOrdered;
};

export type GroupsStats = {
  [Key in GroupsNames]: GroupStats;
};

export type GroupClasifications = {
  first?: Countries;
  second?: Countries;
};

export type GroupsClasifications = {
  [Key in GroupsNames]: GroupClasifications;
};

export type GroupValues = {
  [K1 in Match]?: {
    [K2 in Countries]?: number;
  };
};

export type GroupStageValues = {
  [K1 in GroupsNames]: {
    [K2 in Match]?: {
      [K3 in Countries]?: number;
    };
  };
};

export type PlayoffsMatches = {
  [Key: string]: {
    T1: string | Countries;
    T2: string | Countries;
  };
};

export type PlayoffsValues = {
  [Key: string]: {
    winner: Countries;
    loser: Countries;
  };
};

export type PlayoffsInfo = {
  T1: { group: GroupsNames; position: 'first' | 'second' };
  T2: { group: GroupsNames; position: 'first' | 'second' };
  date: Timestamp;
};

export type FinalPositions = {
  first: Countries | undefined;
  second: Countries | undefined;
  third: Countries | undefined;
  fourth: Countries | undefined;
};

export type ParticipantResult = {
  finalPositions: FinalPositions;
  groupsClasifications: GroupsClasifications;
  participant: string;
  scorer: string;
  results: GroupValues;
  points: number;
};

export type ActualMatch = {
  date: Timestamp;
  match: {
    [Key in Countries]?: number;
  } & { match: Match; playoff: boolean };
};

export type ActualResults = {
  finalPositions: FinalPositions;
  groupsClasifications: GroupsClasifications;
  scorer: string;
  results: Array<ActualMatch>;
};
