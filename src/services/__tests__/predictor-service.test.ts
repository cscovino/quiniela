/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictorService } from '../predictor-service';
import * as firebaseFirestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  db: 'mock-db',
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
});
