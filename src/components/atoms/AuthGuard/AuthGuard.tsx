import React from 'react';
import { useAuthStore } from '@store/auth-store';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import './AuthGuard.css';

export interface AuthGuardProps {
  children: React.ReactNode;
  loginUrl?: string;
  message?: string;
  loadingMessage?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  loginUrl = '/login',
  message,
  loadingMessage = 'Loading...',
}) => {
  const { user, isAuthLoading, initAuth } = useAuthStore();

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

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
