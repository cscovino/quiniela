import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { Predictor } from '@app-types/firestore';

export const predictorService = {
  async getUserPredictors(userId: string): Promise<Predictor[]> {
    const predictorsRef = collection(getDb(), 'users', userId, 'predictors');
    const snapshot = await getDocs(predictorsRef);
    return snapshot.docs.map((doc) => doc.data() as Predictor);
  },

  async createPredictor(userId: string, name: string, avatarUrl?: string): Promise<Predictor> {
    const predictorId = `${userId}-${Date.now()}`;
    const predictor: Omit<Predictor, 'createdAt'> = {
      id: predictorId,
      userId,
      name,
      ...(avatarUrl && { avatarUrl }),
    };

    await setDoc(doc(getDb(), 'users', userId, 'predictors', predictorId), {
      ...predictor,
      createdAt: serverTimestamp(),
    });

    return { ...predictor, createdAt: new Date() as Timestamp };
  },

  async getDefaultPredictor(userId: string): Promise<Predictor | null> {
    const predictorsRef = collection(getDb(), 'users', userId, 'predictors');
    const q = query(predictorsRef, where('id', '==', `${userId}-default`));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Predictor;
  },
};
