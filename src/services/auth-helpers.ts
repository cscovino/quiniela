import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import { getAuthInstance, getDb, initFirebase } from './firebase';
import type { User } from '../types/firestore';

let googleProvider: GoogleAuthProvider | null = null;

function ensureAuth(): Auth {
  initFirebase().catch(() => {});
  return getAuthInstance();
}

function ensureDb(): Firestore {
  initFirebase().catch(() => {});
  return getDb();
}

function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}

const createDefaultPredictor = async (userId: string, displayName: string) => {
  const predictorId = `${userId}-default`;
  await setDoc(doc(ensureDb(), 'users', userId, 'predictors', predictorId), {
    uid: predictorId,
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
  const credential = await createUserWithEmailAndPassword(ensureAuth(), email, password);

  await updateProfile(credential.user, { displayName });

  await setDoc(doc(ensureDb(), 'users', credential.user.uid), {
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
  return signInWithEmailAndPassword(ensureAuth(), email, password);
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const credential = await signInWithPopup(ensureAuth(), getGoogleProvider());

  const userDoc = await getDoc(doc(ensureDb(), 'users', credential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(ensureDb(), 'users', credential.user.uid), {
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
  await signOut(ensureAuth());
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(ensureAuth(), email);
};

export const getCurrentUser = () => ensureAuth().currentUser;

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return ensureAuth().onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      let role = 'user';
      try {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        role = ((idTokenResult.claims as Record<string, unknown>).role as string) || 'user';
      } catch {
        // Fallback to default role if token refresh fails
      }
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
        role,
        createdAt: (firebaseUser.metadata.creationTime
          ? new Date(firebaseUser.metadata.creationTime)
          : new Date()) as unknown as Timestamp,
        lastLoginAt: (firebaseUser.metadata.lastSignInTime
          ? new Date(firebaseUser.metadata.lastSignInTime)
          : new Date()) as unknown as Timestamp,
      });
    } else {
      callback(null);
    }
  });
};
