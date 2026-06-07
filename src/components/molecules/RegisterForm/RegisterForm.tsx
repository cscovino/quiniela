import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';
import { useAuthStore } from '@store/auth-store';

import './RegisterForm.css';

export interface RegisterFormProps {
  translations: {
    title: string;
    subtitle: string;
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    submit: string;
    hasAccount: string;
    loginLink: string;
    googleLogin: string;
    or: string;
    errors: {
      invalidEmail: string;
      weakPassword: string;
      emailInUse: string;
      passwordMismatch: string;
      displayNameRequired: string;
      generic: string;
    };
  };
  onLoginClick: () => void;
  redirectUrl?: string;
  className?: string;
}

export const RegisterForm: FC<RegisterFormProps> = ({
  translations,
  onLoginClick,
  redirectUrl = '/es/predicciones',
  className = '',
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!displayName.trim()) {
      useAuthStore.setState({ error: translations.errors.displayNameRequired });
      return;
    }

    if (password !== confirmPassword) {
      useAuthStore.setState({ error: translations.errors.passwordMismatch });
      return;
    }

    try {
      await register(email, password, displayName);
      window.location.href = redirectUrl;
    } catch {
      // Error handled by store
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error.includes('invalid-email')) return translations.errors.invalidEmail;
    if (error.includes('weak-password')) return translations.errors.weakPassword;
    if (error.includes('email-already-in-use')) return translations.errors.emailInUse;
    return translations.errors.generic;
  };

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className={`register-form ${className}`}>
      <div className="register-form__header">
        <Typography variant="h3">{translations.title}</Typography>
        <Typography variant="small" className="register-form__subtitle">
          {translations.subtitle}
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="register-form__form">
        {error && (
          <div className="register-form__error" role="alert" aria-live="polite">
            <Typography variant="small">{getErrorMessage()}</Typography>
          </div>
        )}

        {!displayName.trim() && error && (
          <div className="register-form__field-error">
            <Typography variant="small">{translations.errors.displayNameRequired}</Typography>
          </div>
        )}

        <Input
          type="text"
          label={translations.displayName}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        <Input
          type="password"
          label={translations.confirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          variant={passwordsMismatch ? 'error' : passwordsMatch ? 'success' : 'default'}
          error={passwordsMismatch ? translations.errors.passwordMismatch : undefined}
        />

        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {translations.submit}
        </Button>
      </form>

      <div className="register-form__divider">
        <span className="register-form__divider-line" />
        <Typography variant="small" className="register-form__divider-text">
          {translations.or}
        </Typography>
        <span className="register-form__divider-line" />
      </div>

      <div className="register-form__footer">
        <Typography variant="small">
          {translations.hasAccount}{' '}
          <button type="button" className="register-form__link" onClick={onLoginClick}>
            {translations.loginLink}
          </button>
        </Typography>
      </div>
    </div>
  );
};
