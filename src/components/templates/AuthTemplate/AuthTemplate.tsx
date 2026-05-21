import React, { useState } from 'react';
import { LoginForm, type LoginFormProps } from '@molecules/LoginForm/LoginForm';
import { RegisterForm, type RegisterFormProps } from '@molecules/RegisterForm/RegisterForm';
import { PixelArt } from '@atoms/PixelArt/PixelArt';
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

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  translations,
  initialMode = 'login',
  locale = 'es',
  className = '',
}) => {
  const redirectUrl = locale === 'en' ? '/en/predictions' : '/predicciones';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className={`auth-template ${className}`}>
      <div className="auth-template__decorations">
        <PixelArt
          sprite="football"
          size={48}
          className="auth-template__sprite auth-template__sprite--football"
        />
        <PixelArt
          sprite="trophy"
          size={48}
          className="auth-template__sprite auth-template__sprite--trophy"
        />
        <PixelArt
          sprite="stadium"
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
