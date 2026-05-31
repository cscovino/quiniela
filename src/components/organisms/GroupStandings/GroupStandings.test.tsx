import { render, screen } from '@testing-library/react';

import { GroupStandings } from './GroupStandings';

const translations = {
  noGroups: 'No groups available',
  team: 'Team',
  pts: 'Pts',
  qualified: 'Qualified',
};

const mockGroups = [
  {
    name: 'Group A',
    standings: [
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
    ],
  },
];

describe('GroupStandings', () => {
  it('renders group name', () => {
    render(<GroupStandings groups={mockGroups} translations={translations} />);
    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('renders team name span and FIFA code span for each team', () => {
    render(<GroupStandings groups={mockGroups} translations={translations} />);
    // Full name span — toggled visible on desktop via CSS (may appear in GroupHeader too)
    const nameEls = screen.getAllByText('Argentina');
    expect(nameEls.length).toBeGreaterThan(0);
    // FIFA code span — toggled visible on mobile via CSS; aria-hidden but present in DOM
    expect(screen.getByText('ARG')).toBeInTheDocument();
  });

  it('renders stats columns', () => {
    render(<GroupStandings groups={mockGroups} translations={translations} />);
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();
  });

  it('shows empty state when no groups', () => {
    render(<GroupStandings groups={[]} translations={translations} />);
    expect(screen.getByText('No groups available')).toBeInTheDocument();
  });
});
