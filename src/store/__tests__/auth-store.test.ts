/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authHelpers from '../../services/auth-helpers';
import { __resetAuthStore, useAuthStore } from '../auth-store';

vi.mock('../../services/auth-helpers', () => ({
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  resetPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe('auth-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetAuthStore();
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthLoading: true,
      error: null,
      login: useAuthStore.getState().login,
      register: useAuthStore.getState().register,
      loginWithGoogle: useAuthStore.getState().loginWithGoogle,
      logout: useAuthStore.getState().logout,
      resetPassword: useAuthStore.getState().resetPassword,
      clearError: useAuthStore.getState().clearError,
      initAuth: useAuthStore.getState().initAuth,
    });
  });

  afterEach(() => {
    useAuthStore.setState({ error: null });
  });

  describe('login', () => {
    it('sets loading state and calls loginWithEmail', async () => {
      (authHelpers.loginWithEmail as any).mockResolvedValue(undefined);

      await useAuthStore.getState().login('test@example.com', 'password123');

      expect(authHelpers.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('sets error state on failure', async () => {
      (authHelpers.loginWithEmail as any).mockRejectedValue(new Error('Invalid credentials'));

      await expect(useAuthStore.getState().login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );

      expect(useAuthStore.getState().error).toBe('Invalid credentials');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('calls registerWithEmail with correct params', async () => {
      (authHelpers.registerWithEmail as any).mockResolvedValue(undefined);

      await useAuthStore.getState().register('test@example.com', 'password123', 'Test User');

      expect(authHelpers.registerWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User',
      );
    });

    it('sets error state on failure', async () => {
      (authHelpers.registerWithEmail as any).mockRejectedValue(new Error('Email already in use'));

      await expect(
        useAuthStore.getState().register('test@example.com', 'password123', 'Test User'),
      ).rejects.toThrow('Email already in use');

      expect(useAuthStore.getState().error).toBe('Email already in use');
    });
  });

  describe('loginWithGoogle', () => {
    it('calls loginWithGoogle helper', async () => {
      (authHelpers.loginWithGoogle as any).mockResolvedValue(undefined);

      await useAuthStore.getState().loginWithGoogle();

      expect(authHelpers.loginWithGoogle).toHaveBeenCalled();
    });

    it('sets error state on failure', async () => {
      (authHelpers.loginWithGoogle as any).mockRejectedValue(new Error('Popup closed'));

      await expect(useAuthStore.getState().loginWithGoogle()).rejects.toThrow('Popup closed');

      expect(useAuthStore.getState().error).toBe('Popup closed');
    });
  });

  describe('logout', () => {
    it('calls logout helper and clears user', async () => {
      (authHelpers.logout as any).mockResolvedValue();

      await useAuthStore.getState().logout();

      expect(authHelpers.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      (authHelpers.logout as any).mockRejectedValue(new Error('Network error'));

      await expect(useAuthStore.getState().logout()).rejects.toThrow('Network error');

      expect(useAuthStore.getState().error).toBe('Network error');
    });
  });

  describe('resetPassword', () => {
    it('calls resetPassword helper', async () => {
      (authHelpers.resetPassword as any).mockResolvedValue();

      await useAuthStore.getState().resetPassword('test@example.com');

      expect(authHelpers.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('sets error state on failure', async () => {
      (authHelpers.resetPassword as any).mockRejectedValue(new Error('User not found'));

      await expect(useAuthStore.getState().resetPassword('unknown@example.com')).rejects.toThrow(
        'User not found',
      );

      expect(useAuthStore.getState().error).toBe('User not found');
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      useAuthStore.setState({ error: 'Some error' });
      expect(useAuthStore.getState().error).toBe('Some error');

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('initAuth', () => {
    it('sets up auth state listener', async () => {
      let authCallback: any;
      (authHelpers.onAuthStateChanged as any).mockImplementation((cb) => {
        authCallback = cb;
        return vi.fn();
      });

      useAuthStore.getState().initAuth();

      expect(authHelpers.onAuthStateChanged).toHaveBeenCalled();

      const mockUser = { uid: 'test-uid', displayName: 'Test User' };
      authCallback!(mockUser);

      await vi.waitFor(() => {
        expect(useAuthStore.getState().user).toEqual(mockUser);
        expect(useAuthStore.getState().isAuthLoading).toBe(false);
      });
    });

    it('sets user to null when logged out', async () => {
      (authHelpers.onAuthStateChanged as any).mockImplementation((cb) => {
        setTimeout(() => cb(null), 0);
        return vi.fn();
      });

      useAuthStore.getState().initAuth();

      await vi.waitFor(() => {
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().isAuthLoading).toBe(false);
      });
    });
  });
});
