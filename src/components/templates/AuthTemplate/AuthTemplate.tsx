import type { FC } from 'react';
import { useState } from 'react';

import { PixelArt } from '@atoms/PixelArt';
import { LoginForm, type LoginFormProps } from '@molecules/LoginForm';
import { RegisterForm, type RegisterFormProps } from '@molecules/RegisterForm';
import { getRoute } from '@utils/i18n';

import './AuthTemplate.css';

export interface AuthTemplateProps {
  translations: {
    login: LoginFormProps['translations'];
    register: RegisterFormProps['translations'];
  };
  initialMode?: 'login' | 'register';
  locale?: 'en' | 'es';
  className?: string;
}

export const AuthTemplate: FC<AuthTemplateProps> = ({
  translations,
  initialMode = 'login',
  locale = 'es',
  className = '',
}) => {
  const redirectUrl = getRoute(locale, 'predictions');
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className={`auth-template ${className}`}>
      <div className="auth-template__decorations">
        <PixelArt
          name="football"
          size={48}
          className="auth-template__sprite auth-template__sprite--football"
        />
        <PixelArt
          name="trophy"
          size={48}
          className="auth-template__sprite auth-template__sprite--trophy"
        />
        <PixelArt
          name="stadium"
          size={48}
          className="auth-template__sprite auth-template__sprite--stadium"
        />
      </div>

      <div className="auth-template__card">
        {mode === 'login' ? (
          <LoginForm
            translations={translations.login}
            onRegisterClick={() => setMode('register')}
            redirectUrl={redirectUrl}
          />
        ) : (
          <RegisterForm
            translations={translations.register}
            onLoginClick={() => setMode('login')}
            redirectUrl={redirectUrl}
          />
        )}
      </div>
    </div>
  );
};
