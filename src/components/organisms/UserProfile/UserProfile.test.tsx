import { render, screen } from '@testing-library/react';

import { useAuthStore } from '@store/auth-store';

import { UserProfile } from './UserProfile';

const mockUser = {
  uid: 'user-1',
  displayName: 'Carlos Enrique',
  email: 'carlos@example.com',
  avatarUrl: undefined,
  role: 'user' as const,
  createdAt: new Date('2026-01-01'),
  lastLoginAt: new Date('2026-01-01'),
};

const translations = {
  editProfile: 'Edit Profile',
  cancelEditing: 'Cancel',
  saveProfile: 'Save Changes',
  saving: 'Saving...',
  profileSaved: 'Profile updated',
  profileSaveError: 'Failed to update profile',
  displayNameLabel: 'Display Name',
  displayNameRequired: 'Display name is required',
  avatarUrlLabel: 'Avatar URL',
  avatarUrlHint: 'Enter a URL for your avatar',
};

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { user: mockUser };
    return selector(state);
  }),
}));

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user display name in h2', () => {
    render(<UserProfile translations={translations} />);
    expect(screen.getByText('Carlos Enrique')).toBeInTheDocument();
  });

  it('renders edit button when editProfile translation provided', () => {
    render(<UserProfile translations={translations} />);
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
  });

  it('renders avatar placeholder with initial when no avatarUrl', () => {
    render(<UserProfile translations={translations} />);
    const placeholder = screen.getByText('CE', { hidden: true });
    expect(placeholder).toBeInTheDocument();
  });

  it('renders avatar image when avatarUrl is set', () => {
    const userWithAvatar = { ...mockUser, avatarUrl: 'https://example.com/avatar.png' };
    (useAuthStore as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { user: userWithAvatar };
      return selector(state);
    });

    render(<UserProfile translations={translations} />);
    const img = screen.getByAltText('Carlos Enrique');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('returns null when user is null', () => {
    (useAuthStore as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { user: null };
      return selector(state);
    });

    const { container } = render(<UserProfile translations={translations} />);
    expect(container).toBeEmptyDOMElement();
  });
});
