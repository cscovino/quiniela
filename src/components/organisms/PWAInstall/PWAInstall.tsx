import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import './PWAInstall.css';

export const PWAInstall: FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
    deferredPrompt.current = null;
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-install" role="banner" aria-label="Install application">
      <button
        type="button"
        className="pwa-install__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
      <span className="pwa-install__text">Install App</span>
      <button type="button" className="pwa-install__btn" onClick={handleInstall}>
        Install
      </button>
    </div>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
