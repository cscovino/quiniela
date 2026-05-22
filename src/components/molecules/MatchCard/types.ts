export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface MatchCardData {
  homeTeam: { fifaCode: string; name: string };
  awayTeam: { fifaCode: string; name: string };
  date: Date;
  status: MatchStatus;
  result?: { home: number; away: number };
  stadium?: string;
  phase?: string;
}
