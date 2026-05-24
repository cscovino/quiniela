import { useAuthStore } from '@store/auth-store';

// Thin pass-through — auth-store owns the init guard
export function initAuth() {
  useAuthStore.getState().initAuth();
}

const CACHE_KEY = 'quiniela_auth_uid';
const CACHE_TS_KEY = 'quiniela_auth_uid_ts';
const CACHE_TTL = 30_000; // 30 seconds

export function getCachedAuthUid(): string | null {
  try {
    const uid = localStorage.getItem(CACHE_KEY);
    const ts = localStorage.getItem(CACHE_TS_KEY);
    if (!uid || !ts) return null;
    if (Date.now() - Number(ts) > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TS_KEY);
      return null;
    }
    return uid;
  } catch {
    return null;
  }
}

export function setCachedAuthUid(uid: string | null) {
  try {
    if (uid) {
      localStorage.setItem(CACHE_KEY, uid);
      localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TS_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}
