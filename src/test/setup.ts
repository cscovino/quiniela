import { vi } from 'vitest';

import '@testing-library/jest-dom';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]', options: {} })),
  getApp: vi.fn(() => ({ name: '[DEFAULT]', options: {} })),
}));

vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    addScope = vi.fn();
    setCustomParameters = vi.fn();
  }
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
      onAuthStateChanged: vi.fn((cb) => {
        cb(null);
        return vi.fn();
      }),
      setPersistence: vi.fn(() => Promise.resolve()),
    })),
    browserLocalPersistence: 'local',
    setPersistence: vi.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(() => Promise.resolve()),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(() => Promise.resolve()),
    sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
    GoogleAuthProvider: MockGoogleAuthProvider,
    onAuthStateChanged: vi.fn((auth, cb) => {
      cb(null);
      return vi.fn();
    }),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => 'mock-firestore'),
  collection: vi.fn(() => 'mock-collection'),
  collectionGroup: vi.fn(() => 'mock-collection-group'),
  doc: vi.fn(() => 'mock-doc'),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  setDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
  query: vi.fn((collectionRef) => collectionRef),
  where: vi.fn(() => ({ type: 'where' })),
  orderBy: vi.fn(() => ({ type: 'orderBy' })),
  limit: vi.fn(() => ({ type: 'limit' })),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  deleteField: vi.fn(() => ({ _methodName: 'FieldValue.delete' })),
  Timestamp: {
    now: vi.fn(() => new Date()),
    fromDate: vi.fn((d) => d),
  },
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => null),
  getToken: vi.fn(() => Promise.resolve('mock-token')),
  onMessage: vi.fn(() => vi.fn()),
}));

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

window.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

URL.createObjectURL = vi.fn(() => 'mock-url');
URL.revokeObjectURL = vi.fn();
