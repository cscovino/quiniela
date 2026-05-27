import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';

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
      <Button variant="ghost" size="sm" onClick={handleDismiss} aria-label="Dismiss">
        <Icon name="close" size={14} />
      </Button>
      <span className="pwa-install__text">Install App</span>
      <Button variant="primary" size="sm" onClick={handleInstall}>
        Install
      </Button>
    </div>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
