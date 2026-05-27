import type { FC, ReactNode } from 'react';

import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { useAuthStore } from '@store/auth-store';

import './AuthGuard.css';

export interface AuthGuardProps {
  children: ReactNode;
  loginUrl?: string;
  message?: string;
  loadingMessage?: string;
}

export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  loginUrl = '/es/login',
  message,
  loadingMessage = 'Loading...',
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) {
    return (
      <div className="auth-guard">
        <div className="auth-guard__loading">
          <Spinner size="lg" />
          <Typography variant="body">{loadingMessage}</Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-guard">
        <div className="auth-guard__locked">
          <Typography variant="h2">{message || 'Login required'}</Typography>
          <a href={loginUrl}>
            <Button variant="primary" size="md">
              Login
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
