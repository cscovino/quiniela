import React, { useState } from 'react';
import { Input } from '@atoms/Input/Input';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
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

export const RegisterForm: React.FC<RegisterFormProps> = ({
  translations,
  onLoginClick,
  redirectUrl = '/predicciones',
  className = '',
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!displayName.trim()) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await register(email, password, displayName);
      window.location.href = redirectUrl;
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    try {
      await loginWithGoogle();
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
          <div className="register-form__error">
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

      <Button variant="secondary" onClick={handleGoogleRegister} isLoading={isLoading} fullWidth>
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
