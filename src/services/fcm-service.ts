import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';

import { getDb, getMessagingInstance } from './firebase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY || '';

// An empty VAPID key is accepted by getToken() but yields tokens that can never
// receive messages — fail loudly here instead of registering a dead token.
function assertVapidKey(): boolean {
  if (!VAPID_PUBLIC_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      '[fcm] VITE_FIREBASE_VAPID_PUBLIC_KEY is not set — push notifications are disabled.',
    );
    return false;
  }
  return true;
}

export const fcmService = {
  async requestPermission(userId: string): Promise<string | null> {
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;
    if (!assertVapidKey()) return null;

    const msg = await getMessagingInstance();
    if (!msg) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(msg, {
        vapidKey: VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) await this.saveToken(userId, token);
      return token;
    } catch {
      return null;
    }
  },

  async saveToken(userId: string, token: string): Promise<void> {
    await setDoc(doc(getDb(), 'users', userId, 'fcm_tokens', token), {
      token,
      createdAt: new Date(),
      platform: this.getPlatform(),
    });
  },

  async removeToken(userId: string, token: string): Promise<void> {
    try {
      await deleteDoc(doc(getDb(), 'users', userId, 'fcm_tokens', token));
    } catch {
      // Token may not exist
    }
  },

  async unsubscribe(userId: string, token: string): Promise<void> {
    await this.removeToken(userId, token);
    const msg = await getMessagingInstance();
    if (msg) {
      try {
        const { deleteToken } = await import('firebase/messaging');
        await deleteToken(msg);
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

  async onMessage(
    callback: (payload: Record<string, unknown>) => void,
  ): Promise<(() => void) | null> {
    const msg = await getMessagingInstance();
    if (!msg || typeof window === 'undefined') return null;
    const { onMessage: fbOnMessage } = await import('firebase/messaging');
    return fbOnMessage(msg, callback as (payload: unknown) => void);
  },

  async getCurrentToken(): Promise<string | null> {
    if (!assertVapidKey()) return null;
    const msg = await getMessagingInstance();
    if (!msg) return null;
    try {
      return await getToken(msg, { vapidKey: VAPID_PUBLIC_KEY });
    } catch {
      return null;
    }
  },
};
