/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tournamentService } from '../tournament-service';
import * as firebaseFirestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  getDb: () => 'mock-db',
  initFirebase: vi.fn(() => Promise.resolve()),
}));

const mockTeam = {
  fifaCode: 'ARG',
  name: 'Argentina',
  group: 'A',
  flag: 'ar',
};

const mockMatch = {
  id: 'match-1',
  slug: 'arg-vs-fra',
  homeTeamId: 'argentina',
  awayTeamId: 'france',
  date: {
    toMillis: () => Date.now() + 86400000,
    toDate: () => new Date(Date.now() + 86400000),
  },
  status: 'scheduled',
  phase: 'group',
  groupId: 'A',
  stadium: 'Lusail Stadium',
  result: { home: null, away: null },
};

const mockPredictorStats = {
  userId: 'user-1',
  predictorId: 'user-1-default',
  totalPoints: 100,
  accuracy: 0.85,
  currentStreak: 3,
};

describe('tournament-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTournament', () => {
    it('returns tournament data when exists', async () => {
      const mockTournament = { id: 'world-cup-2026', name: 'FIFA World Cup 2026' };
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockTournament,
      } as any);

      const result = await tournamentService.getTournament();

      expect(result).toEqual(mockTournament);
      expect(firebaseFirestore.doc).toHaveBeenCalled();
      expect(firebaseFirestore.getDoc).toHaveBeenCalled();
    });

    it('returns null when tournament does not exist', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await tournamentService.getTournament();

      expect(result).toBeNull();
    });
  });

  describe('getGroups', () => {
    it('returns groups ordered by order field', async () => {
      const mockGroups = [
        { name: 'Group A', order: 1 },
        { name: 'Group B', order: 2 },
      ];
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: mockGroups.map((g) => ({ data: () => g })),
      } as any);

      const result = await tournamentService.getGroups();

      expect(result).toEqual(mockGroups);
      expect(firebaseFirestore.collection).toHaveBeenCalled();
      expect(firebaseFirestore.orderBy).toHaveBeenCalledWith('order');
    });

    it('returns empty array when no groups', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await tournamentService.getGroups();

      expect(result).toEqual([]);
    });
  });

  describe('getTeams', () => {
    it('returns all teams', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockTeam }],
      } as any);

      const result = await tournamentService.getTeams();

      expect(result).toEqual([mockTeam]);
    });

    it('returns empty array when no teams', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await tournamentService.getTeams();

      expect(result).toEqual([]);
    });
  });

  describe('getMatches', () => {
    it('returns all matches ordered by date', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockMatch, id: 'match-1' }],
      } as any);

      const result = await tournamentService.getMatches();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'match-1',
        slug: 'arg-vs-fra',
      });
    });

    it('filters by phase when provided', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockMatch, id: 'match-1' }],
      } as any);

      await tournamentService.getMatches({ phase: 'group' });

      expect(firebaseFirestore.where).toHaveBeenCalledWith('phase', '==', 'group');
    });

    it('filters by groupId when provided', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockMatch, id: 'match-1' }],
      } as any);

      await tournamentService.getMatches({ groupId: 'A' });

      expect(firebaseFirestore.where).toHaveBeenCalledWith('groupId', '==', 'A');
    });

    it('filters by status when provided', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockMatch, id: 'match-1' }],
      } as any);

      const result = await tournamentService.getMatches({ status: 'scheduled' });

      expect(result).toHaveLength(1);
    });

    it('returns empty array when no matches', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await tournamentService.getMatches();

      expect(result).toEqual([]);
    });
  });

  describe('getGroupStandings', () => {
    it('returns group standings', async () => {
      const mockStandings = {
        groupId: 'A',
        teams: [{ teamId: 'argentina', played: 3, won: 2, drawn: 1, lost: 0, points: 7 }],
      };
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockStandings }],
      } as any);

      const result = await tournamentService.getGroupStandings();

      expect(result).toEqual([mockStandings]);
    });

    it('returns empty array when no standings', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await tournamentService.getGroupStandings();

      expect(result).toEqual([]);
    });
  });

  describe('getPredictorStats', () => {
    it('returns predictor stats when exists', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockPredictorStats,
      } as any);

      const result = await tournamentService.getPredictorStats('user-1', 'user-1-default');

      expect(result).toEqual(mockPredictorStats);
    });

    it('returns null when stats do not exist', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await tournamentService.getPredictorStats('user-1', 'user-1-default');

      expect(result).toBeNull();
    });
  });

  describe('getAllPredictorStats', () => {
    it('returns all predictor stats sorted by points', async () => {
      vi.mocked(firebaseFirestore.collectionGroup).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.query).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.where).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [
          {
            ref: { path: 'users/user-1/predictors/user-1-default/stats/world-cup-2026' },
            data: () => ({ ...mockPredictorStats, totalPoints: 150 }),
          },
          {
            ref: { path: 'users/user-2/predictors/user-2-default/stats/world-cup-2026' },
            data: () => ({ ...mockPredictorStats, totalPoints: 100 }),
          },
        ],
      } as any);

      const result = await tournamentService.getAllPredictorStats();

      expect(result).toHaveLength(2);
      expect(result[0].totalPoints).toBeGreaterThanOrEqual(result[1].totalPoints);
      expect(result[0].userId).toBe('user-1');
      expect(result[1].userId).toBe('user-2');
    });

    it('returns empty array when no stats', async () => {
      vi.mocked(firebaseFirestore.collectionGroup).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.query).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.where).mockReturnValue({} as any);
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await tournamentService.getAllPredictorStats();

      expect(result).toEqual([]);
    });
  });
});
