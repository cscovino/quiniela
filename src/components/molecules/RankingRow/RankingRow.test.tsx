import { render, screen } from '@testing-library/react';

import type { TodayMatchBet } from '@organisms/RankingsTable';
import type {
  BestPlayersPredictionView,
  FinalPhasePredictionView,
  GroupPredictionView,
} from '@services/predictor-predictions';

import { RankingRow } from './RankingRow';

describe('RankingRow', () => {
  it('renders PredictorAvatar img when predictorId and pixelArt provided (SC#3, D-01)', () => {
    const { container } = render(
      <RankingRow
        position={1}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        predictorId="p1"
        pixelArt={{ seed: 'p1', options: {} }}
      />,
    );
    expect(container.querySelector('.predictor-avatar__img')).toBeInTheDocument();
    expect(container.querySelector('.avatar')).not.toBeInTheDocument();
  });

  it('renders PredictorAvatar img via tier-2 id-seed when predictorId given but no pixelArt (D-04)', () => {
    const { container } = render(
      <RankingRow
        position={2}
        displayName="Maria"
        points={30}
        accuracy={70}
        streak={1}
        predictorId="p2"
      />,
    );
    expect(container.querySelector('.predictor-avatar__img')).toBeInTheDocument();
  });

  it('renders user info', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={85} streak={3} />);
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('shows position', () => {
    render(<RankingRow position={1} displayName="Carlos" points={45} accuracy={85} streak={3} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('shows points', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={85} streak={3} />);
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('shows accuracy percentage', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={85} streak={3} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows streak when greater than 0', () => {
    render(<RankingRow position={5} displayName="Carlos" points={45} accuracy={85} streak={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    const { container } = render(
      <RankingRow
        position={5}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        isCurrentUser
      />,
    );
    expect(container.firstChild).toHaveClass('ranking-row--current');
  });

  it('shows rank change arrow for non-podium positions', () => {
    const { container } = render(
      <RankingRow
        position={5}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        rankChange="up"
      />,
    );
    expect(container.querySelector('.ranking-row__rank-change--up')).toBeInTheDocument();
  });

  it('shows a podium medal instead of the rank arrow for the top 3', () => {
    const { container } = render(
      <RankingRow
        position={1}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        rankChange="up"
      />,
    );
    expect(container.querySelector('.ranking-row__medal')).toBeInTheDocument();
    expect(container.querySelector('.pixel-art--medal-gold')).toBeInTheDocument();
    expect(container.querySelector('.ranking-row__rank-change--up')).not.toBeInTheDocument();
  });

  it('shows badge icons when badges provided', () => {
    render(
      <RankingRow
        position={5}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        badges={{ 'first-blood': '2026-05-01', 'on-fire': '2026-05-15' }}
      />,
    );
    const badges = document.querySelector('.ranking-row__badges');
    expect(badges).toBeInTheDocument();
    expect(badges?.children.length).toBe(2);
  });

  it('renders the four prediction sections in the requested order (Final 4, Best players, Groups, Matches)', () => {
    const finalPhasePrediction: FinalPhasePredictionView = {
      positions: [
        { fifaCode: 'ARG', position: 1, correct: true },
        { fifaCode: 'BRA', position: 2, correct: false },
        { fifaCode: 'FRA', position: 3, correct: null },
        { fifaCode: 'ESP', position: 4, correct: null },
      ],
    };
    const bestPlayersPrediction: BestPlayersPredictionView = {
      scorer: { name: 'Mbappé', correct: true },
      goalkeeper: { name: 'Martínez', correct: false },
    };
    const groupPredictions: GroupPredictionView[] = [
      {
        groupId: 'a',
        label: 'Group A',
        finished: true,
        teams: [
          { fifaCode: 'MEX', position: 1, correct: true },
          { fifaCode: 'USA', position: 2, correct: false },
          { fifaCode: 'RSA', position: 3, correct: null },
          { fifaCode: 'KOR', position: 4, correct: null },
        ],
      },
    ];
    const todayMatchBets: TodayMatchBet[] = [
      {
        matchId: 'd1a',
        homeTeam: 'ARG',
        awayTeam: 'BRA',
        homeScore: 2,
        awayScore: 1,
        status: 'finished',
        date: '2026-06-11',
        dayLabel: 'MD 1 — 11 Jun',
      },
    ];

    const { container } = render(
      <RankingRow
        position={1}
        displayName="Carlos"
        points={45}
        accuracy={85}
        streak={3}
        finalPhasePrediction={finalPhasePrediction}
        bestPlayersPrediction={bestPlayersPrediction}
        groupPredictions={groupPredictions}
        todayMatchBets={todayMatchBets}
      />,
    );

    const scroll = container.querySelector('.ranking-row__predictions-scroll');
    expect(scroll).toBeInTheDocument();
    const blocks = Array.from(scroll!.children) as HTMLElement[];

    const classify = (el: HTMLElement): string => {
      if (el.querySelector('.ranking-row__player-chip')) return 'bestPlayers';
      if (el.querySelector('.ranking-row__match-prediction')) return 'match';
      if (el.querySelector('.ranking-row__pos-cell')) {
        const label = el.querySelector('.ranking-row__day-label')?.textContent?.trim() ?? '';
        if (label === 'Final 4') return 'finalFour';
        return 'group';
      }
      return 'unknown';
    };

    expect(blocks.map(classify)).toEqual(['finalFour', 'bestPlayers', 'group', 'match']);
  });
});
