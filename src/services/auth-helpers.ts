import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '../types/firestore';

const googleProvider = new GoogleAuthProvider();

const createDefaultPredictor = async (userId: string, displayName: string) => {
  const predictorId = `${userId}-default`;
  await setDoc(doc(db, 'users', userId, 'predictors', predictorId), {
    id: predictorId,
    userId,
    name: displayName,
    avatarUrl: null,
    createdAt: serverTimestamp(),
  });
  return predictorId;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  avatarUrl?: string,
  favoriteTeamId?: string,
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    displayName,
    email,
    avatarUrl: avatarUrl || null,
    favoriteTeamId: favoriteTeamId || null,
    role: 'user',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  await createDefaultPredictor(credential.user.uid, displayName);

  return credential;
};

export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const credential = await signInWithPopup(auth, googleProvider);

  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      displayName: credential.user.displayName || '',
      email: credential.user.email || '',
      avatarUrl: credential.user.photoURL || null,
      favoriteTeamId: null,
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    await createDefaultPredictor(credential.user.uid, credential.user.displayName || 'Predictor');
  }

  return credential;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getCurrentUser = () => auth.currentUser;

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
        role: 'user',
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      });
    } else {
      callback(null);
    }
  });
};
