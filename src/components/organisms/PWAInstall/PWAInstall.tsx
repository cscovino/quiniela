import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';

import './PWAInstall.css';

export interface PWAInstallProps {
  translations?: {
    bannerLabel?: string;
    dismiss?: string;
    text?: string;
    install?: string;
  };
}

const defaultTranslations = {
  bannerLabel: 'Install application',
  dismiss: 'Dismiss',
  text: 'Install App',
  install: 'Install',
};

export const PWAInstall: FC<PWAInstallProps> = ({ translations = {} }) => {
  const labels = { ...defaultTranslations, ...translations };
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
    <div className="pwa-install" role="banner" aria-label={labels.bannerLabel}>
      <Button variant="ghost" size="sm" onClick={handleDismiss} aria-label={labels.dismiss}>
        <Icon name="close" size={14} />
      </Button>
      <span className="pwa-install__text">{labels.text}</span>
      <Button variant="primary" size="sm" onClick={handleInstall}>
        {labels.install}
      </Button>
    </div>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
