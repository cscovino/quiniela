import React, { useState } from 'react';
import { Input } from '@atoms/Input/Input';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { useAuthStore } from '@store/auth-store';
import './LoginForm.css';

export interface LoginFormProps {
  translations: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    forgotPassword: string;
    noAccount: string;
    registerLink: string;
    googleLogin: string;
    or: string;
    errors: {
      invalidEmail: string;
      invalidPassword: string;
      wrongPassword: string;
      userNotFound: string;
      tooManyRequests: string;
      generic: string;
    };
    success: {
      resetEmail: string;
    };
  };
  onRegisterClick: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  translations,
  onRegisterClick,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, loginWithGoogle, resetPassword, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
    } catch {
      // Error handled by store
    }
  };

  const handleResetPassword = async () => {
    clearError();
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      // Error handled by store
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error.includes('invalid-email')) return translations.errors.invalidEmail;
    if (error.includes('wrong-password') || error.includes('invalid-credential'))
      return translations.errors.wrongPassword;
    if (error.includes('user-not-found')) return translations.errors.userNotFound;
    if (error.includes('too-many-requests')) return translations.errors.tooManyRequests;
    return translations.errors.generic;
  };

  if (showReset) {
    return (
      <div className={`login-form ${className}`}>
        <Typography variant="h3">{translations.forgotPassword}</Typography>
        {resetSent ? (
          <Typography variant="body" className="login-form__success">
            {translations.success.resetEmail}
          </Typography>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form__reset">
            <Input
              type="email"
              label={translations.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
              {translations.submit}
            </Button>
          </form>
        )}
        <button
          type="button"
          className="login-form__back"
          onClick={() => {
            setShowReset(false);
            setResetSent(false);
          }}
        >
          ← Back to login
        </button>
      </div>
    );
  }

  return (
    <div className={`login-form ${className}`}>
      <div className="login-form__header">
        <Typography variant="h3">{translations.title}</Typography>
        <Typography variant="small" className="login-form__subtitle">
          {translations.subtitle}
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        {error && (
          <div className="login-form__error">
            <Typography variant="small">{getErrorMessage()}</Typography>
          </div>
        )}

        <Input
          type="email"
          label={translations.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          type="password"
          label={translations.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="button" className="login-form__forgot" onClick={() => setShowReset(true)}>
          {translations.forgotPassword}
        </button>

        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {translations.submit}
        </Button>
      </form>

      <div className="login-form__divider">
        <span className="login-form__divider-line" />
        <Typography variant="small" className="login-form__divider-text">
          {translations.or}
        </Typography>
        <span className="login-form__divider-line" />
      </div>

      <Button variant="secondary" onClick={handleGoogleLogin} isLoading={isLoading} fullWidth>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
            fill="#EA4335"
          />
        </svg>
        {translations.googleLogin}
      </Button>

      <div className="login-form__footer">
        <Typography variant="small">
          {translations.noAccount}{' '}
          <button type="button" className="login-form__link" onClick={onRegisterClick}>
            {translations.registerLink}
          </button>
        </Typography>
      </div>
    </div>
  );
};
