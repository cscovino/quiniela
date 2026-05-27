import type { FC } from 'react';
import { useCallback, useEffect } from 'react';

import { Icon, type IconName } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';

import './Toast.css';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  icon?: IconName;
}

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICON_MAP: Record<string, IconName> = {
  success: 'check',
  error: 'close',
  info: 'info',
  warning: 'warning',
};

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  const handleDismiss = useCallback(
    (id: string) => {
      onDismiss(id);
    },
    [onDismiss],
  );

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => onDismiss(toast.id), 5000));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast__icon">
            <Icon name={toast.icon || ICON_MAP[toast.type]} size={18} />
          </div>
          <div className="toast__content">
            <Typography variant="small" className="toast__title">
              {toast.title}
            </Typography>
            <Typography variant="caption" className="toast__message">
              {toast.message}
            </Typography>
          </div>
          <button
            className="toast__dismiss"
            onClick={() => handleDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
