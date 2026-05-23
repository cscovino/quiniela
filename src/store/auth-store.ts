import { create } from 'zustand';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChanged,
} from '../services/auth-helpers';
import type { User } from '../types/firestore';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

let unsubscribe: (() => void) | null = null;

function cacheAuthUid(uid: string | null) {
  try {
    if (uid) {
      localStorage.setItem('quiniela_auth_uid', uid);
    } else {
      localStorage.removeItem('quiniela_auth_uid');
    }
  } catch {
    // localStorage unavailable
  }
}

export function __resetAuthStore() {
  unsubscribe?.();
  unsubscribe = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await loginWithEmail(email, password);
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      });
      throw err;
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      await registerWithEmail(email, password, displayName);
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Registration failed',
      });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await loginWithGoogle();
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Google login failed',
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logout();
      set({ user: null, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Logout failed',
      });
      throw err;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await resetPassword(email);
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Password reset failed',
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    if (unsubscribe) return;
    unsubscribe = onAuthStateChanged((user) => {
      cacheAuthUid(user?.uid ?? null);
      set({ user, isAuthLoading: false });
    });
  },
}));
