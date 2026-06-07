import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';
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
    emailRequired?: string;
    passwordRequired?: string;
    backToLogin?: string;
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
  redirectUrl?: string;
  className?: string;
}

export const LoginForm: FC<LoginFormProps> = ({
  translations,
  onRegisterClick,
  redirectUrl = '/es/predicciones',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const login = useAuthStore((s) => s.login);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email.trim()) {
      useAuthStore.setState({ error: translations.emailRequired || 'Email is required' });
      return;
    }
    if (!password) {
      useAuthStore.setState({ error: translations.passwordRequired || 'Password is required' });
      return;
    }
    try {
      await login(email, password);
      window.location.href = redirectUrl;
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
          {translations.backToLogin || '← Back to login'}
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
          <div className="login-form__error" role="alert" aria-live="polite">
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
