import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders label', () => {
    const futureDate = new Date(Date.now() + 60000);
    render(<CountdownTimer targetDate={futureDate} label="Starts in" />);
    expect(screen.getByText('Starts in')).toBeInTheDocument();
  });

  it('shows expired text when date is in the past', () => {
    const pastDate = new Date(Date.now() - 60000);
    render(<CountdownTimer targetDate={pastDate} expiredText="Match started" />);
    expect(screen.getByText('Match started')).toBeInTheDocument();
  });

  it('updates countdown every second', () => {
    const futureDate = new Date(Date.now() + 5000);
    render(<CountdownTimer targetDate={futureDate} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('04')).toBeInTheDocument();
  });

  it('shows expired when countdown reaches zero', () => {
    const futureDate = new Date(Date.now() + 1000);
    render(<CountdownTimer targetDate={futureDate} expiredText="Expired" />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});
