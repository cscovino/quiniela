/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminBestPlayersPage } from '../AdminBestPlayersPage';

const mockAuthState: Record<string, any> = {
  user: null,
  isAuthLoading: false,
  isLoading: false,
  error: null,
  initAuth: vi.fn(),
};

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn((selector?: (s: Record<string, any>) => any) =>
    selector ? selector(mockAuthState) : mockAuthState,
  ),
}));

vi.mock('@services/admin-service', () => ({
  setBestPlayersResult: vi.fn(),
}));

vi.mock('@services/firebase', () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock('@/config/tournament', () => ({
  TOURNAMENT_ID: 'test-tournament',
}));

const mockDocSnap = { exists: vi.fn(), data: vi.fn() };
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'bets-collection'),
  doc: vi.fn(() => 'actual-doc'),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  setDoc: vi.fn(() => Promise.resolve()),
}));

function renderPage(authOverrides: Record<string, any> = {}) {
  Object.assign(mockAuthState, {
    user: null,
    isAuthLoading: false,
    ...authOverrides,
  });

  mockGetDoc.mockResolvedValue(mockDocSnap);

  return render(<AdminBestPlayersPage />);
}

describe('AdminBestPlayersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDocSnap.exists.mockReturnValue(false);
    mockDocSnap.data.mockReturnValue({});
    mockGetDoc.mockResolvedValue(mockDocSnap);
    mockGetDocs.mockResolvedValue({ size: 0 });
  });

  describe('auth guard', () => {
    it('shows verifying state while auth is loading', async () => {
      renderPage({ isAuthLoading: true, user: null });

      expect(screen.getByText('Verifying access...')).toBeInTheDocument();
    });

    it('shows loading state while fetching data', async () => {
      mockGetDoc.mockImplementationOnce(() => new Promise<never>(() => {}));

      renderPage({ user: { role: 'admin' } as any });

      expect(await screen.findByText('Loading best player data...')).toBeInTheDocument();
    });
  });

  describe('admin form', () => {
    it('renders title and fields', async () => {
      renderPage({ user: { role: 'admin' } as any });

      expect(await screen.findByText('Admin - Best Players')).toBeInTheDocument();
      expect(screen.getByText('Top Scorer')).toBeInTheDocument();
      expect(screen.getByText('Best Goalkeeper')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Kylian Mbappé')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Emiliano Martínez')).toBeInTheDocument();
      expect(screen.getByText('Save Best Players')).toBeInTheDocument();
    });

    it('pre-fills inputs from existing data', async () => {
      mockDocSnap.exists.mockReturnValue(true);
      mockDocSnap.data.mockReturnValue({
        topScorer: 'Kylian Mbappé',
        bestGoalkeeper: 'Emiliano Martínez',
      });

      renderPage({ user: { role: 'admin' } as any });

      const topScorerInput = await screen.findByPlaceholderText('e.g. Kylian Mbappé');
      expect(topScorerInput).toHaveValue('Kylian Mbappé');
      expect(screen.getByPlaceholderText('e.g. Emiliano Martínez')).toHaveValue(
        'Emiliano Martínez',
      );
    });

    it('shows predictor count', async () => {
      mockGetDocs.mockResolvedValue({ size: 5 });

      renderPage({ user: { role: 'admin' } as any });

      expect(
        await screen.findByText(/5 predictor\(s\) have submitted best-player predictions\./),
      ).toBeInTheDocument();
    });

    it('hides predictor count when zero', async () => {
      renderPage({ user: { role: 'admin' } as any });

      await waitFor(() => {
        expect(
          screen.queryByText(/\d+ predictor\(s\) have submitted best-player predictions\./),
        ).not.toBeInTheDocument();
      });
    });

    it('disables submit when both fields empty', async () => {
      renderPage({ user: { role: 'admin' } as any });

      const btn = (await screen.findByText('Save Best Players')).closest('button')!;
      expect(btn).toHaveAttribute('disabled');
    });

    it('enables submit when a field is filled', async () => {
      const user = userEvent.setup();

      renderPage({ user: { role: 'admin' } as any });

      const input = await screen.findByPlaceholderText('e.g. Kylian Mbappé');
      await user.type(input, 'Lamine Yamal');

      expect(screen.getByText('Save Best Players').closest('button')).toBeEnabled();
    });
  });

  describe('submit flow', () => {
    it('calls setBestPlayersResult on submit', async () => {
      const user = userEvent.setup();

      renderPage({ user: { role: 'admin' } as any });

      const input = await screen.findByPlaceholderText('e.g. Kylian Mbappé');
      await user.type(input, 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));

      const { setBestPlayersResult } = await import('@services/admin-service');
      expect(setBestPlayersResult).toHaveBeenCalledWith('test-tournament', 'Lamine Yamal', '');
    });

    it('shows success message', async () => {
      const user = userEvent.setup();
      const { setBestPlayersResult } = await import('@services/admin-service');
      vi.mocked(setBestPlayersResult).mockResolvedValueOnce(undefined);

      renderPage({ user: { role: 'admin' } as any });

      await user.type(await screen.findByPlaceholderText('e.g. Kylian Mbappé'), 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));

      expect(
        await screen.findByText('Best player results saved. Scoring has been triggered.'),
      ).toBeInTheDocument();
    });

    it('shows error message', async () => {
      const user = userEvent.setup();
      const { setBestPlayersResult } = await import('@services/admin-service');
      vi.mocked(setBestPlayersResult).mockRejectedValueOnce(new Error('Network error'));

      renderPage({ user: { role: 'admin' } as any });

      await user.type(await screen.findByPlaceholderText('e.g. Kylian Mbappé'), 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));

      expect(await screen.findByText('Error: Network error')).toBeInTheDocument();
    });

    it('shows fallback error', async () => {
      const user = userEvent.setup();
      const { setBestPlayersResult } = await import('@services/admin-service');
      vi.mocked(setBestPlayersResult).mockRejectedValueOnce(null);

      renderPage({ user: { role: 'admin' } as any });

      await user.type(await screen.findByPlaceholderText('e.g. Kylian Mbappé'), 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));

      expect(
        await screen.findByText('Error: Failed to save best player results. Please try again.'),
      ).toBeInTheDocument();
    });

    it('dismisses error', async () => {
      const user = userEvent.setup();
      const { setBestPlayersResult } = await import('@services/admin-service');
      vi.mocked(setBestPlayersResult).mockRejectedValueOnce(new Error('Network error'));

      renderPage({ user: { role: 'admin' } as any });

      await user.type(await screen.findByPlaceholderText('e.g. Kylian Mbappé'), 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));
      expect(await screen.findByText('Error: Network error')).toBeInTheDocument();

      await user.click(screen.getByText('Dismiss'));

      expect(screen.queryByText('Error: Network error')).not.toBeInTheDocument();
    });

    it('disables inputs while saving', async () => {
      const user = userEvent.setup();
      const { setBestPlayersResult } = await import('@services/admin-service');
      vi.mocked(setBestPlayersResult).mockImplementationOnce(() => new Promise<never>(() => {}));

      renderPage({ user: { role: 'admin' } as any });

      const input = await screen.findByPlaceholderText('e.g. Kylian Mbappé');
      await user.type(input, 'Lamine Yamal');
      await user.click(screen.getByText('Save Best Players'));

      expect(input).toBeDisabled();
      expect(screen.getByPlaceholderText('e.g. Emiliano Martínez')).toBeDisabled();
    });
  });
});
