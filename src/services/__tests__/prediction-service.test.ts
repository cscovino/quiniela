/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictionService } from '../prediction-service';
import * as firebaseFirestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  db: 'mock-db',
}));

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

describe('prediction-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitMatchBet', () => {
    it('submits a valid match prediction', async () => {
      vi.mocked(firebaseFirestore.getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockMatch,
        } as any)
        .mockResolvedValueOnce({
          exists: () => false,
          data: () => null,
        } as any);
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await predictionService.submitMatchBet(
        'user-1',
        'user-1-default',
        'match-1',
        2,
        1,
      );

      expect(result.success).toBe(true);
      expect(firebaseFirestore.setDoc).toHaveBeenCalled();
    });

    it('rejects if match not found', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await predictionService.submitMatchBet(
        'user-1',
        'user-1-default',
        'invalid-match',
        2,
        1,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Match not found');
    });

    it('rejects if match already finished', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockMatch, status: 'finished' }),
      } as any);

      const result = await predictionService.submitMatchBet(
        'user-1',
        'user-1-default',
        'match-1',
        2,
        1,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Match already started or finished');
    });

    it('rejects if prediction already exists', async () => {
      vi.mocked(firebaseFirestore.getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockMatch,
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ homeScore: 1, awayScore: 0 }),
        } as any);

      const result = await predictionService.submitMatchBet(
        'user-1',
        'user-1-default',
        'match-1',
        2,
        1,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already predicted this match');
    });
  });

  describe('submitKnockoutBet', () => {
    it('submits a valid knockout prediction', async () => {
      vi.mocked(firebaseFirestore.getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ ...mockMatch, phase: 'knockout' }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => false,
          data: () => null,
        } as any);
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await predictionService.submitKnockoutBet(
        'user-1',
        'user-1-default',
        'match-1',
        'argentina',
      );

      expect(result.success).toBe(true);
    });

    it('rejects if teams not determined', async () => {
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockMatch, phase: 'knockout', homeTeamId: null, awayTeamId: null }),
      } as any);

      const result = await predictionService.submitKnockoutBet(
        'user-1',
        'user-1-default',
        'match-1',
        'argentina',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Teams are not yet determined');
    });
  });

  describe('submitGroupBet', () => {
    it('submits a valid group prediction', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await predictionService.submitGroupBet('user-1', 'user-1-default', 'A', [
        'argentina',
        'france',
        'brazil',
        'germany',
      ]);

      expect(result.success).toBe(true);
    });

    it('rejects if a match in group already started', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => ({ ...mockMatch, status: 'live' }) }],
      } as any);

      const result = await predictionService.submitGroupBet('user-1', 'user-1-default', 'A', [
        'argentina',
        'france',
        'brazil',
        'germany',
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('A match in this group has already started');
    });
  });

  describe('submitBatchMatchBets', () => {
    it('submits multiple match predictions', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);

      const matches = [
        { ...mockMatch, id: 'match-1' },
        { ...mockMatch, id: 'match-2' },
      ];

      const result = await predictionService.submitBatchMatchBets(
        'user-1',
        'user-1-default',
        {
          'match-1': { home: 2, away: 1 },
          'match-2': { home: 1, away: 1 },
        },
        matches as any,
      );

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    it('skips finished matches', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);

      const matches = [
        { ...mockMatch, id: 'match-1', status: 'finished' },
        { ...mockMatch, id: 'match-2' },
      ];

      const result = await predictionService.submitBatchMatchBets(
        'user-1',
        'user-1-default',
        {
          'match-1': { home: 2, away: 1 },
          'match-2': { home: 1, away: 1 },
        },
        matches as any,
      );

      expect(result.successCount).toBe(1);
    });

    it('handles batch commit failure', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.reject(new Error('Network error'))),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);

      const result = await predictionService.submitBatchMatchBets(
        'user-1',
        'user-1-default',
        {
          'match-1': { home: 2, away: 1 },
        },
        [{ ...mockMatch, id: 'match-1' }] as any,
      );

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toContain('Network error');
    });
  });

  describe('submitBatchGroupBets', () => {
    it('submits multiple group predictions', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);

      const result = await predictionService.submitBatchGroupBets('user-1', 'user-1-default', {
        A: ['argentina', 'france', 'brazil', 'germany'],
        B: ['spain', 'portugal', 'netherlands', 'italy'],
      });

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    it('rejects groups with invalid number of teams', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);

      const result = await predictionService.submitBatchGroupBets('user-1', 'user-1-default', {
        A: ['argentina', 'france'],
        B: ['spain', 'portugal', 'netherlands', 'italy'],
      });

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toContain('must have exactly 4 teams');
    });
  });

  describe('getExistingBets', () => {
    it('returns all existing bets for a predictor', async () => {
      vi.mocked(firebaseFirestore.getDocs)
        .mockResolvedValueOnce({
          docs: [
            {
              data: () => ({
                userId: 'user-1',
                matchId: 'match-1',
                homeScore: 2,
                awayScore: 1,
              }),
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          docs: [
            {
              data: () => ({
                userId: 'user-1',
                matchId: 'match-2',
                predictedWinner: 'argentina',
              }),
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          docs: [
            {
              data: () => ({
                userId: 'user-1',
                groupId: 'A',
                positions: ['argentina', 'france', 'brazil', 'germany'],
              }),
            },
          ],
        } as any);

      const result = await predictionService.getExistingBets('user-1', 'user-1-default');

      expect(result.matchBets.get('match-1')).toEqual({ home: 2, away: 1 });
      expect(result.knockoutBets.get('match-2')).toBe('argentina');
      expect(result.groupBets.get('A')).toEqual(['argentina', 'france', 'brazil', 'germany']);
    });

    it('returns empty maps when no bets exist', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await predictionService.getExistingBets('user-1', 'user-1-default');

      expect(result.matchBets.size).toBe(0);
      expect(result.knockoutBets.size).toBe(0);
      expect(result.groupBets.size).toBe(0);
    });
  });
});
