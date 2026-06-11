import type { Timestamp } from 'firebase/firestore';

import type { LocalizedName } from '@utils/i18n';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
export type TournamentStatus = 'draft' | 'active' | 'finished';
export type UserRole = 'user' | 'admin';
export type PhaseType =
  | 'group'
  | 'round-of-32'
  | 'round-of-16'
  | 'quarterfinals'
  | 'semifinals'
  | 'third-place'
  | 'final';

export interface Tournament {
  slug: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  deadline?: Timestamp; // NEW — prediction submission deadline
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
  name: LocalizedName;
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
  pointsCalculated?: boolean;
  createdAt: Timestamp;
  // Knockout placeholder slot labels, present until the teams are resolved
  // (e.g. "1A", "3C/D/E", "W-R32-1", "L-SF-1"). See src/utils/knockout-slot.ts.
  tbd?: boolean;
  tbdHome?: string;
  tbdAway?: string;
}

// AvatarOptions — D-01: constrained 6-trait interface (D-08: co-located with Predictor)
export interface AvatarOptions {
  skinColor?: string; // bare 6-hex, e.g. 'ffdbb4'
  hair?: string; // pixel-art id, e.g. 'short01' | 'long05'
  hairColor?: string; // bare 6-hex
  clothing?: string; // pixel-art id, e.g. 'variant03'
  clothingColor?: string; // bare 6-hex
  glasses?: string; // pixel-art id, e.g. 'dark01' | 'light02'
  // NEW style axes (optional, None = absent):
  eyes?: string; // pixel-art id, e.g. 'variant01'
  beard?: string; // pixel-art id, e.g. 'variant01' — NO beardColor axis
  mouth?: string; // pixel-art id, e.g. 'happy01'
  hat?: string; // pixel-art id, e.g. 'variant01'
  accessories?: string; // pixel-art id, e.g. 'variant01'
  // NEW color axes (optional):
  eyesColor?: string; // bare 6-hex
  mouthColor?: string; // bare 6-hex
  hatColor?: string; // bare 6-hex
  accessoriesColor?: string; // bare 6-hex
  glassesColor?: string; // bare 6-hex — frames color for existing glasses
}

export interface Predictor {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string; // legacy, keep optional
  avatar?: { bgColor: string; emoji: string }; // legacy, keep optional
  pixelArt?: { seed: string; options: AvatarOptions }; // NEW (AVATAR-02)
  favouriteTeamId?: string;
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

export interface FinalPhaseBet {
  userId: string;
  predictorId: string;
  first: string;
  second: string;
  third: string;
  fourth: string;
  points: number;
  firstScoredAt?: Timestamp; // D-09: set when first position is scored
  secondScoredAt?: Timestamp; // D-09: set when second position is scored
  thirdScoredAt?: Timestamp; // D-09: set when third position is scored
  fourthScoredAt?: Timestamp; // D-09: set when fourth position is scored
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BestPlayersBet {
  userId: string;
  predictorId: string;
  bestGoalkeeper: string;
  bestScorer: string;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  finishedBets: number;
  accuracy: number;
  currentStreak: number;
  maxStreak: number;
  pointsHistory: { timestamp: Timestamp; points: number; matchId: string }[];
  badgesAwarded: Record<string, string>;
  rank?: number;
  percentile?: number;
  lastRankUpdate?: Timestamp;
  lastUpdated: Timestamp;
  groupQualified?: number;
  // Per-category subtotals that sum into totalPoints. Derived (set absolutely)
  // by recomputePredictorTotals so totalPoints stays idempotent.
  matchPoints?: number;
  groupPoints?: number;
  knockoutPoints?: number;
  finalFourPoints?: number;
  bestPlayerPoints?: number;
}

export interface Notification {
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
