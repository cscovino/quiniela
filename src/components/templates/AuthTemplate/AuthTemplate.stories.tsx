import type { Meta, StoryObj } from '@storybook/react-vite';

import type { LoginFormProps } from '@molecules/LoginForm';
import type { RegisterFormProps } from '@molecules/RegisterForm';

import { AuthTemplate } from './AuthTemplate';

const meta = {
  component: AuthTemplate,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const loginTranslations: LoginFormProps['translations'] = {
  title: 'Welcome Back',
  subtitle: 'Sign in to make your predictions',
  email: 'Email',
  password: 'Password',
  submit: 'Sign In',
  forgotPassword: 'Forgot password?',
  noAccount: "Don't have an account?",
  registerLink: 'Sign up',
  googleLogin: 'Continue with Google',
  or: 'or',
  errors: {
    invalidEmail: 'Please enter a valid email address',
    invalidPassword: 'Password must be at least 6 characters',
    wrongPassword: 'Incorrect password. Please try again.',
    userNotFound: 'No account found with this email',
    tooManyRequests: 'Too many attempts. Please try again later.',
    generic: 'Something went wrong. Please try again.',
  },
  success: {
    resetEmail: 'Password reset email sent! Check your inbox.',
  },
};

const registerTranslations: RegisterFormProps['translations'] = {
  title: 'Create Account',
  subtitle: 'Join the prediction game',
  displayName: 'Display Name',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  submit: 'Create Account',
  hasAccount: 'Already have an account?',
  loginLink: 'Sign in',
  googleLogin: 'Continue with Google',
  or: 'or',
  errors: {
    invalidEmail: 'Please enter a valid email address',
    weakPassword: 'Password must be at least 6 characters',
    emailInUse: 'An account with this email already exists',
    passwordMismatch: 'Passwords do not match',
    displayNameRequired: 'Display name is required',
    generic: 'Something went wrong. Please try again.',
  },
};

export const LoginMode: Story = {
  args: {
    translations: { login: loginTranslations, register: registerTranslations },
    initialMode: 'login',
    locale: 'en',
  },
};

export const RegisterMode: Story = {
  args: {
    translations: { login: loginTranslations, register: registerTranslations },
    initialMode: 'register',
    locale: 'en',
  },
};

export const SpanishLogin: Story = {
  args: {
    translations: { login: loginTranslations, register: registerTranslations },
    initialMode: 'login',
    locale: 'es',
  },
};
