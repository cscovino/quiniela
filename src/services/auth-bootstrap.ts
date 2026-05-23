import { useAuthStore } from '@store/auth-store';

let initialized = false;

export function initAuth() {
  if (initialized) return;
  initialized = true;
  useAuthStore.getState().initAuth();
}

export function getCachedAuthUid(): string | null {
  try {
    return localStorage.getItem('quiniela_auth_uid');
  } catch {
    return null;
  }
}

export function setCachedAuthUid(uid: string | null) {
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
