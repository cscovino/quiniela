import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, messaging } from './firebase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY || '';

export const fcmService = {
  async requestPermission(userId: string): Promise<string | null> {
    if (!('Notification' in window)) {
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      return null;
    }

    if (!messaging) {
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        await this.saveToken(userId, token);
      }

      return token;
    } catch {
      return null;
    }
  },

  async saveToken(userId: string, token: string): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'fcm_tokens', token), {
      token,
      createdAt: new Date(),
      platform: this.getPlatform(),
    });
  },

  async removeToken(userId: string, token: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId, 'fcm_tokens', token));
    } catch {
      // Token may not exist
    }
  },

  async unsubscribe(userId: string, token: string): Promise<void> {
    await this.removeToken(userId, token);

    if (messaging) {
      try {
        const { deleteToken } = await import('firebase/messaging');
        await deleteToken(messaging);
      } catch {
        // Token may not exist
      }
    }
  },

  getPlatform(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  },

  onMessage(callback: (payload: Record<string, unknown>) => void): (() => void) | null {
    if (!messaging || typeof window === 'undefined') return null;

    return onMessage(messaging, callback);
  },

  async getCurrentToken(): Promise<string | null> {
    if (!messaging) return null;

    try {
      return await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    } catch {
      return null;
    }
  },
};
