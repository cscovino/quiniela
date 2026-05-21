/* eslint-disable @typescript-eslint/no-explicit-any */
// Firebase mock for Storybook environment
// This file replaces all firebase/* imports in Storybook

const mockApp = { name: '[DEFAULT]', options: {} };

export const initializeApp = () => mockApp;
export const getApp = () => mockApp;

export const getAuth = () => ({
  currentUser: null,
  onAuthStateChanged: (cb: (user: any) => void) => {
    cb(null);
    return () => {};
  },
  setPersistence: () => Promise.resolve(),
});

export const browserLocalPersistence = 'local';
export const setPersistence = () => Promise.resolve();
export const createUserWithEmailAndPassword = () => Promise.resolve({ user: {} });
export const signInWithEmailAndPassword = () => Promise.resolve({ user: {} });
export const signInWithPopup = () => Promise.resolve({ user: {} });
export const signOut = () => Promise.resolve();
export const sendPasswordResetEmail = () => Promise.resolve();
export const GoogleAuthProvider = function () {
  this.addScope = () => {};
  this.setCustomParameters = () => {};
};
export const onAuthStateChanged = (_auth: any, cb: (user: any) => void) => {
  cb(null);
  return () => {};
};

export const getFirestore = () => ({});
export const collection = () => 'mock-collection';
export const doc = () => 'mock-doc';
export const getDoc = () => Promise.resolve({ exists: () => false, data: () => null });
export const getDocs = () => Promise.resolve({ docs: [] });
export const setDoc = () => Promise.resolve();
export const addDoc = () => Promise.resolve({ id: 'mock-id' });
export const updateDoc = () => Promise.resolve();
export const deleteDoc = () => Promise.resolve();
export const writeBatch = () => ({
  set: () => {},
  update: () => {},
  delete: () => {},
  commit: () => Promise.resolve(),
});
export const query = (ref: any) => ref;
export const where = () => ({ type: 'where' });
export const orderBy = () => ({ type: 'orderBy' });
export const limit = () => ({ type: 'limit' });
export const serverTimestamp = () => 'server-timestamp';
export const Timestamp = {
  now: () => new Date(),
  fromDate: (d: Date) => d,
};

export const getMessaging = () => null;
export const getToken = () => Promise.resolve('mock-token');
export const onMessage = () => () => {};
