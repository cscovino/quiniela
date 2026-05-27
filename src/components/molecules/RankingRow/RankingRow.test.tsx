import { render, screen } from '@testing-library/react';

import { RankingRow } from './RankingRow';

describe('RankingRow', () => {
  it('renders user info', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={0.67} streak={3} />);
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('shows position', () => {
    render(<RankingRow position={1} displayName="Carlos" points={45} accuracy={0.67} streak={3} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('shows points', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={0.67} streak={3} />);
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('shows accuracy percentage', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={0.67} streak={3} />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('shows streak when greater than 0', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={0.67} streak={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    const { container } = render(
      <RankingRow
        position={5}
        displayName="Carlos"
        points={45}
        accuracy={0.67}
        streak={3}
        isCurrentUser
      />,
    );
    expect(container.firstChild).toHaveClass('ranking-row--current');
  });
});
