import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

const firebaseConfig = {
  apiKey: self.__firebase_config ? JSON.parse(self.__firebase_config).apiKey : '',
  authDomain: self.__firebase_config ? JSON.parse(self.__firebase_config).authDomain : '',
  projectId: self.__firebase_config ? JSON.parse(self.__firebase_config).projectId : '',
  storageBucket: self.__firebase_config ? JSON.parse(self.__firebase_config).storageBucket : '',
  messagingSenderId: self.__firebase_config ? JSON.parse(self.__firebase_config).messagingSenderId : '',
  appId: self.__firebase_config ? JSON.parse(self.__firebase_config).appId : '',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const { notification, data } = payload;

  if (!notification) return;

  const notificationOptions = {
    body: notification.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: notification.tag || 'default',
    data: data || {},
    actions: notification.actions || [],
    renotify: true,
    requireInteraction: false,
  };

  return self.registration.showNotification(notification.title || 'Quiniela', notificationOptions);
});
