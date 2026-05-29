import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RankingsTable } from './RankingsTable';

const mockRankings = [
  {
    userId: 'user-1',
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    rankChange: 'up' as const,
    predictionsCount: 4,
  },
  {
    userId: 'user-2',
    displayName: 'Maria',
    points: 98,
    accuracy: 78,
    streak: 4,
    rankChange: 'same' as const,
    predictionsCount: 3,
  },
  {
    userId: 'user-3',
    displayName: 'Juan',
    points: 87,
    accuracy: 72,
    streak: 2,
    rankChange: 'down' as const,
    predictionsCount: 1,
  },
];

describe('RankingsTable', () => {
  it('renders title', () => {
    render(<RankingsTable rankings={mockRankings} />);
    expect(screen.getByText('Global Rankings')).toBeInTheDocument();
  });

  it('renders ranking entries', () => {
    render(<RankingsTable rankings={mockRankings} />);
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(<RankingsTable rankings={mockRankings} currentUserId="user-2" />);
    const mariaRow = screen.getByText('Maria').closest('.ranking-row');
    expect(mariaRow).toHaveClass('ranking-row--current');
  });

  it('shows pagination when totalPages > 1', () => {
    render(<RankingsTable rankings={mockRankings} page={1} totalPages={3} />);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('hides pagination when totalPages is 1', () => {
    render(<RankingsTable rankings={mockRankings} page={1} totalPages={1} />);
    expect(screen.queryByText('Page 1 of 1')).not.toBeInTheDocument();
  });

  it('calls onPageChange when next clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(
      <RankingsTable
        rankings={mockRankings}
        page={1}
        totalPages={3}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(screen.getByText('Next'));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('shows empty state when no rankings', () => {
    render(<RankingsTable rankings={[]} />);
    expect(screen.getByText('No rankings available yet')).toBeInTheDocument();
  });
});
