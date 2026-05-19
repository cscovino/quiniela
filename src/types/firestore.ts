import type { Timestamp } from 'firebase/firestore';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
export type TournamentStatus = 'draft' | 'active' | 'finished';
export type UserRole = 'user' | 'admin';
export type PhaseType = 'group' | 'round-of-16' | 'quarterfinals' | 'semifinals' | 'final';

export interface Tournament {
  slug: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: TournamentStatus;
  phases: { name: PhaseType; order: number }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Group {
  slug: string;
  name: string;
  order: number;
  teamCount: number;
  createdAt: Timestamp;
}

export interface Team {
  fifaCode: string;
  name: string;
  flagUrl: string;
  groupId: string;
  createdAt: Timestamp;
}

export interface Match {
  slug: string;
  phase: PhaseType;
  groupId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date: Timestamp;
  stadium: string;
  result: { home: number | null; away: number | null };
  status: MatchStatus;
  predictionDeadline: Timestamp;
  createdAt: Timestamp;
}

export interface Predictor {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}

export interface MatchBet {
  userId: string;
  predictorId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points: number;
  isExact: boolean;
  isWinner: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupBet {
  userId: string;
  predictorId: string;
  groupId: string;
  positions: string[];
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface KnockoutBet {
  userId: string;
  predictorId: string;
  matchId: string;
  predictedWinner: string;
  points: number;
  createdAt: Timestamp;
}

export interface TeamStanding {
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

export interface GroupStandings {
  groupId: string;
  lastUpdated: Timestamp;
  standings: TeamStanding[];
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  favoriteTeamId?: string;
  role: UserRole;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface PredictorStats {
  predictorId: string;
  tournamentId: string;
  totalPoints: number;
  exactBets: number;
  winnerBets: number;
  totalBets: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  pointsHistory: { timestamp: Timestamp; points: number; matchId: string }[];
  badgesAwarded: Record<string, string>;
  lastUpdated: Timestamp;
}

export interface Notification {
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
