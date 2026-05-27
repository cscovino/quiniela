import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAuthStore } from '@store/auth-store';

import { RegisterForm } from './RegisterForm';

const meta = {
  component: RegisterForm,
  tags: ['autodocs'],
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTranslations = {
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

export const Default: Story = {
  args: {
    translations: defaultTranslations,
    onLoginClick: () => {},
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ isLoading: true, error: null });
      return <Story />;
    },
  ],
  args: {
    translations: defaultTranslations,
    onLoginClick: () => {},
  },
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ isLoading: false, error: 'email-already-in-use' });
      return <Story />;
    },
  ],
  args: {
    translations: defaultTranslations,
    onLoginClick: () => {},
  },
};

export const PasswordMismatch: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ isLoading: false, error: null });
      return <Story />;
    },
  ],
  args: {
    translations: defaultTranslations,
    onLoginClick: () => {},
  },
};
