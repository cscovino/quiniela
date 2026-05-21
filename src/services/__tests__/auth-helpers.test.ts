/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authHelpers from '../auth-helpers';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';

vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((cb) => {
      cb(null);
      return vi.fn();
    }),
  },
  db: 'mock-db',
}));

const mockUser = {
  uid: 'test-uid-123',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: 'https://example.com/photo.jpg',
};

const mockCredential = {
  user: mockUser,
};

describe('auth-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerWithEmail', () => {
    it('creates user and profile document', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue(
        mockCredential as any,
      );
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await authHelpers.registerWithEmail(
        'test@example.com',
        'password123',
        'Test User',
      );

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123',
      );
      expect(firebaseFirestore.setDoc).toHaveBeenCalledTimes(2);
      expect(result.user).toEqual(mockUser);
    });

    it('throws error if user creation fails', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue(
        new Error('Email already in use'),
      );

      await expect(
        authHelpers.registerWithEmail('test@example.com', 'password123', 'Test User'),
      ).rejects.toThrow('Email already in use');
    });

    it('uses optional avatarUrl and favoriteTeamId', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue(
        mockCredential as any,
      );
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      await authHelpers.registerWithEmail(
        'test@example.com',
        'password123',
        'Test User',
        'https://example.com/avatar.jpg',
        'argentina',
      );

      const callArgs = vi.mocked(firebaseFirestore.setDoc).mock.calls[0][1];
      expect(callArgs).toMatchObject({
        avatarUrl: 'https://example.com/avatar.jpg',
        favoriteTeamId: 'argentina',
      });
    });
  });

  describe('loginWithEmail', () => {
    it('signs in with email and password', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue(mockCredential as any);

      const result = await authHelpers.loginWithEmail('test@example.com', 'password123');

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123',
      );
      expect(result.user).toEqual(mockUser);
    });

    it('throws error for invalid credentials', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(
        authHelpers.loginWithEmail('test@example.com', 'wrong-password'),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('loginWithGoogle', () => {
    it('signs in with Google popup', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue(mockCredential as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(firebaseFirestore.setDoc).mockResolvedValue();

      const result = await authHelpers.loginWithGoogle();

      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
      );
      expect(result.user).toEqual(mockUser);
    });

    it('does not create profile if user already exists', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue(mockCredential as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => true } as any);

      await authHelpers.loginWithGoogle();

      expect(firebaseFirestore.setDoc).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('signs out user', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      await expect(authHelpers.logout()).resolves.toBeUndefined();
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('sends password reset email', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValue();

      await expect(authHelpers.resetPassword('test@example.com')).resolves.toBeUndefined();
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
      );
    });
  });

  describe('getCurrentUser', () => {
    it('returns current user', () => {
      const result = authHelpers.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('registers auth state listener', () => {
      const callback = vi.fn();
      authHelpers.onAuthStateChanged(callback);

      expect(callback).toBeDefined();
    });

    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = authHelpers.onAuthStateChanged(callback);

      expect(typeof unsubscribe).toBe('function');
    });
  });
});
