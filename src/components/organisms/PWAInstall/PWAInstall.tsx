import React, { useEffect, useState, useCallback } from 'react';
import { fcmService } from '@services/fcm-service';
import { useAuthStore } from '@store/auth-store';
import './PWAInstall.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstall: React.FC = () => {
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    if (user) {
      checkNotificationPermission();
    }
  }, [user]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleEnableNotifications = useCallback(async () => {
    if (!user) return;

    const token = await fcmService.requestPermission(user.uid);
    if (token) {
      setNotificationsEnabled(true);
    }
  }, [user]);

  const handleDisableNotifications = useCallback(async () => {
    if (!user) return;

    const token = await fcmService.getCurrentToken();
    if (token) {
      await fcmService.unsubscribe(user.uid, token);
      setNotificationsEnabled(false);
    }
  }, [user]);

  if (!isInstallable && notificationsEnabled) return null;

  return (
    <div className="pwa-install">
      {isInstallable && !isInstalled && (
        <button className="pwa-install__btn" onClick={handleInstall}>
          Install App
        </button>
      )}

      {user && (
        <button
          className={`pwa-install__btn pwa-install__btn--${notificationsEnabled ? 'enabled' : 'disabled'}`}
          onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
        >
          {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
        </button>
      )}
    </div>
  );
};
