import type { FC } from 'react';

import { ToastContainer } from '@atoms/Toast';
import { useToastStore } from '@store/toast-store';

export const ToastProvider: FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
};
