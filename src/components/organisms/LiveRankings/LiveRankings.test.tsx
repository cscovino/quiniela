import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveRankings } from './LiveRankings';

vi.mock('@services/live-data-service', () => ({
  fetchLiveRankings: vi.fn(),
}));

import { fetchLiveRankings } from '@services/live-data-service';

const mockFetch = vi.mocked(fetchLiveRankings);

describe('LiveRankings', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows server-rendered initial data on first render (no skeleton flash)', () => {
    mockFetch.mockResolvedValue([]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.queryByText('No rankings available yet')).not.toBeInTheDocument();
  });

  it('replaces initial data with fresh fetch on mount', async () => {
    mockFetch.mockResolvedValue([
      {
        userId: 'u2',
        predictorId: 'p2',
        displayName: 'Maria',
        points: 99,
        accuracy: 90,
        streak: 5,
      },
    ]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
    expect(screen.queryByText('Carlos')).not.toBeInTheDocument();
  });

  it('keeps initial data on empty fetch (offline/empty fallback)', async () => {
    mockFetch.mockResolvedValue([]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('shows skeleton only when there is no initial data and the fetch is pending', async () => {
    let resolveFetch: (value: never[]) => void = () => {};
    mockFetch.mockImplementation(
      () =>
        new Promise<never[]>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    render(<LiveRankings initialRankings={[]} title="Rankings" />);

    await waitFor(() => {
      expect(document.querySelector('.skeleton-rankings')).toBeInTheDocument();
    });

    await act(async () => {
      resolveFetch([]);
    });
  });

  it('refetches on every mount (no shared cache across navigations)', async () => {
    mockFetch.mockResolvedValue([]);

    const { unmount } = render(
      <LiveRankings initialRankings={[]} title="Rankings" />,
    );
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    unmount();

    render(<LiveRankings initialRankings={[]} title="Rankings" />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
