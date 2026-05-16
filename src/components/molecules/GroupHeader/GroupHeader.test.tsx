import { render, screen } from '@testing-library/react';
import { GroupHeader } from './GroupHeader';

const mockStandings = [
  {
    teamId: 'arg',
    teamName: 'Argentina',
    fifaCode: 'ARG',
    position: 1,
    played: 3,
    won: 3,
    drawn: 0,
    lost: 0,
    goalsFor: 7,
    goalsAgainst: 1,
    points: 9,
  },
  {
    teamId: 'fra',
    teamName: 'France',
    fifaCode: 'FRA',
    position: 2,
    played: 3,
    won: 2,
    drawn: 0,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 2,
    points: 6,
  },
  {
    teamId: 'den',
    teamName: 'Denmark',
    fifaCode: 'DEN',
    position: 3,
    played: 3,
    won: 1,
    drawn: 0,
    lost: 2,
    goalsFor: 2,
    goalsAgainst: 4,
    points: 3,
  },
  {
    teamId: 'tun',
    teamName: 'Tunisia',
    fifaCode: 'TUN',
    position: 4,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 3,
    goalsFor: 1,
    goalsAgainst: 8,
    points: 0,
  },
];

describe('GroupHeader', () => {
  it('renders group name', () => {
    render(<GroupHeader name="Group A" />);
    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('shows qualified teams', () => {
    render(<GroupHeader name="Group A" standings={mockStandings} />);
    expect(screen.getByText('Qualified:')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('hides qualified section when no standings', () => {
    render(<GroupHeader name="Group A" />);
    expect(screen.queryByText('Qualified:')).not.toBeInTheDocument();
  });
});
