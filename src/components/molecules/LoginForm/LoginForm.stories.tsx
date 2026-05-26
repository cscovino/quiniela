import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '@store/auth-store';

const meta = {
  component: LoginForm,
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTranslations = {
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

export const Default: Story = {
  args: {
    translations: defaultTranslations,
    onRegisterClick: () => {},
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
    onRegisterClick: () => {},
  },
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ isLoading: false, error: 'wrong-password' });
      return <Story />;
    },
  ],
  args: {
    translations: defaultTranslations,
    onRegisterClick: () => {},
  },
};

export const ShowReset: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isLoading: false, error: null });
      return <LoginForm translations={defaultTranslations} onRegisterClick={() => {}} />;
    },
  ],
};

export const ResetSent: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isLoading: false, error: null });
      return <LoginForm translations={defaultTranslations} onRegisterClick={() => {}} />;
    },
  ],
};