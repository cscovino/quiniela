/* eslint-disable @typescript-eslint/no-explicit-any */
import * as firebaseFirestore from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AVATAR_PRESETS } from '@utils/avatar-presets';

import { predictorService } from '../predictor-service';

vi.mock('../firebase', () => ({
  getDb: () => 'mock-db',
  initFirebase: vi.fn(() => Promise.resolve()),
}));

describe('predictor-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPredictors', () => {
    it('returns all predictors for a user', async () => {
      const mockPredictors = [
        { id: 'user-1-default', userId: 'user-1', name: 'Default' },
        { id: 'user-1-friends', userId: 'user-1', name: 'Friends' },
      ];
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: mockPredictors.map((p) => ({ data: () => p })),
      } as any);

      const result = await predictorService.getUserPredictors('user-1');

      expect(result).toEqual(mockPredictors);
      expect(firebaseFirestore.collection).toHaveBeenCalledWith(
        'mock-db',
        'users',
        'user-1',
        'predictors',
      );
    });

    it('returns empty array when no predictors', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await predictorService.getUserPredictors('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('createPredictor', () => {
    it('creates a new predictor with timestamp', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await predictorService.createPredictor('user-1', 'My Predictor');

      expect(result.name).toBe('My Predictor');
      expect(result.userId).toBe('user-1');
      expect(firebaseFirestore.setDoc).toHaveBeenCalled();
    });

    it('creates a predictor with avatarUrl when provided', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await predictorService.createPredictor(
        'user-1',
        'My Predictor',
        'https://example.com/avatar.jpg',
      );

      expect(result).toMatchObject({
        name: 'My Predictor',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('creates a predictor with pixelArt when provided as 5th arg', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const pixelArt = {
        seed: 'my-seed-123',
        options: {
          skinColor: AVATAR_PRESETS.skinColor[1],
          hair: AVATAR_PRESETS.hair[1],
          hairColor: AVATAR_PRESETS.hairColor[1],
          clothing: AVATAR_PRESETS.clothing[1],
          clothingColor: AVATAR_PRESETS.clothingColor[1],
          glasses: AVATAR_PRESETS.glasses[1],
        },
      };

      const result = await predictorService.createPredictor(
        'user-1',
        'My Predictor',
        undefined,
        'team-mex',
        pixelArt,
      );

      expect(result).toMatchObject({ name: 'My Predictor', pixelArt });
      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ pixelArt }),
      );
    });

    it('rejects createPredictor with invalid pixelArt seed', async () => {
      await expect(
        predictorService.createPredictor('user-1', 'My Predictor', undefined, undefined, {
          seed: '',
          options: {},
        }),
      ).rejects.toThrow('Invalid avatar seed');
    });
  });

  describe('getDefaultPredictor', () => {
    it('returns default predictor when exists', async () => {
      const mockPredictor = { id: 'user-1-default', userId: 'user-1', name: 'Default' };
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [{ data: () => mockPredictor }],
      } as any);

      const result = await predictorService.getDefaultPredictor('user-1');

      expect(result).toEqual(mockPredictor);
      expect(firebaseFirestore.where).toHaveBeenCalledWith('id', '==', 'user-1-default');
    });

    it('returns null when no default predictor', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as any);

      const result = await predictorService.getDefaultPredictor('user-1');

      expect(result).toBeNull();
    });
  });

  describe('updatePredictor', () => {
    it('updates predictor name', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      await predictorService.updatePredictor('user-1', 'user-1-default', { name: 'New Name' });

      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: 'New Name' }),
        expect.objectContaining({ merge: true }),
      );
    });

    it('updates predictor avatar', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      await predictorService.updatePredictor('user-1', 'user-1-default', {
        avatar: { bgColor: '#ff0000', emoji: '⚽' },
      });

      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ avatar: { bgColor: '#ff0000', emoji: '⚽' } }),
        expect.objectContaining({ merge: true }),
      );
    });

    it('rejects empty name', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', { name: '' }),
      ).rejects.toThrow('Name cannot be empty');
    });

    it('rejects name too long', async () => {
      const longName = 'a'.repeat(41);
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', { name: longName }),
      ).rejects.toThrow('40 characters or less');
    });

    it('rejects invalid bgColor', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          avatar: { bgColor: 'not-a-color', emoji: '⚽' },
        }),
      ).rejects.toThrow('Invalid background color');
    });

    it('persists pixelArt and calls deleteField for legacy avatar/avatarUrl', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();
      // Mock deleteField to return a sentinel so we can detect it in the payload
      vi.mocked(firebaseFirestore.deleteField).mockReturnValue({
        isEqual: vi.fn(),
        _methodName: 'FieldValue.delete',
      } as any);

      const validPixelArt = {
        seed: 'abc123',
        options: {
          skinColor: AVATAR_PRESETS.skinColor[0],
          hair: AVATAR_PRESETS.hair[0],
          hairColor: AVATAR_PRESETS.hairColor[0],
          clothing: AVATAR_PRESETS.clothing[0],
          clothingColor: AVATAR_PRESETS.clothingColor[0],
          glasses: AVATAR_PRESETS.glasses[0],
        },
      };

      await predictorService.updatePredictor('user-1', 'user-1-default', {
        pixelArt: validPixelArt,
      });

      expect(firebaseFirestore.deleteField).toHaveBeenCalled();
      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          pixelArt: validPixelArt,
          avatar: expect.anything(), // deleteField sentinel
          avatarUrl: expect.anything(), // deleteField sentinel
        }),
        expect.objectContaining({ merge: true }),
      );
    });

    it('rejects out-of-set hair value', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          pixelArt: { seed: 'x', options: { hair: 'NOT_IN_SET' } },
        }),
      ).rejects.toThrow('Invalid hair');
    });

    it('rejects empty seed', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          pixelArt: { seed: '', options: {} },
        }),
      ).rejects.toThrow('Invalid avatar seed');
    });

    it('rejects seed longer than 64 chars', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          pixelArt: { seed: 'a'.repeat(65), options: {} },
        }),
      ).rejects.toThrow('Invalid avatar seed');
    });

    it('accepts glasses undefined (represents None — no throw)', async () => {
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();
      vi.mocked(firebaseFirestore.deleteField).mockReturnValue({
        isEqual: vi.fn(),
        _methodName: 'FieldValue.delete',
      } as any);

      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          pixelArt: {
            seed: 'valid-seed',
            options: { glasses: undefined, skinColor: AVATAR_PRESETS.skinColor[0] },
          },
        }),
      ).resolves.toBeUndefined();
    });

    it('rejects unknown glasses id', async () => {
      await expect(
        predictorService.updatePredictor('user-1', 'user-1-default', {
          pixelArt: { seed: 'valid-seed', options: { glasses: 'unknown-glasses-99' } },
        }),
      ).rejects.toThrow('Invalid glasses');
    });
  });

  describe('deletePredictor', () => {
    it('deletes predictor with no bets', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(firebaseFirestore.deleteDoc).mockResolvedValue();

      const result = await predictorService.deletePredictor('user-1', 'user-1-default');

      expect(result.deletedCounts).toEqual({});
      expect(firebaseFirestore.deleteDoc).toHaveBeenCalled();
    });

    it('deletes predictor with bets (cascade)', async () => {
      const mockBatch = {
        commit: vi.fn(() => Promise.resolve()),
        delete: vi.fn(),
      };
      vi.mocked(firebaseFirestore.writeBatch).mockReturnValue(mockBatch as any);
      vi.mocked(firebaseFirestore.deleteDoc).mockResolvedValue();

      // bets: 1 doc, group_bets: 0, knockout_bets: 0
      vi.mocked(firebaseFirestore.getDocs)
        .mockResolvedValueOnce({
          docs: [{ ref: { path: 'tournaments/world-cup-2026/bets/bet1' } }],
        } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any);

      // final_phase_bets, best_players_bets, stats all exist
      vi.mocked(firebaseFirestore.getDoc)
        .mockResolvedValueOnce({ exists: () => true } as any)
        .mockResolvedValueOnce({ exists: () => true } as any)
        .mockResolvedValueOnce({ exists: () => true } as any);

      const result = await predictorService.deletePredictor('user-1', 'user-1-default');

      expect(result.deletedCounts).toBeDefined();
      expect(Object.keys(result.deletedCounts).length).toBeGreaterThan(0);
      expect(firebaseFirestore.deleteDoc).toHaveBeenCalled();
    });

    it('is idempotent - can run on already deleted predictor', async () => {
      vi.mocked(firebaseFirestore.getDocs).mockResolvedValue({ docs: [] } as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(firebaseFirestore.deleteDoc).mockResolvedValue();

      const result = await predictorService.deletePredictor('user-1', 'already-deleted');

      expect(result.deletedCounts).toEqual({});
    });
  });

  describe('getUserPredictorsWithStats', () => {
    it('returns predictors with stats and progress', async () => {
      vi.mocked(firebaseFirestore.getDocs)
        .mockResolvedValueOnce({
          docs: [{ data: () => ({ id: 'p1', userId: 'user-1', name: 'Default' }) }],
        } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any);

      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);

      const result = await predictorService.getUserPredictorsWithStats('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Default');
      expect(result[0].stats).toBeNull();
      expect(result[0].progress).toBeDefined();
      expect(result[0].progress.groupsSubmitted).toBe(0);
    });

    it('returns predictors with stats when they exist', async () => {
      vi.mocked(firebaseFirestore.getDocs)
        .mockResolvedValueOnce({
          docs: [{ data: () => ({ id: 'p1', userId: 'user-1', name: 'Default' }) }],
        } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: [] } as any);

      vi.mocked(firebaseFirestore.getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalPoints: 100, accuracy: 0.8 }),
      } as any);

      const result = await predictorService.getUserPredictorsWithStats('user-1');

      expect(result[0].stats).not.toBeNull();
      expect(result[0].stats?.totalPoints).toBe(100);
    });
  });
});
