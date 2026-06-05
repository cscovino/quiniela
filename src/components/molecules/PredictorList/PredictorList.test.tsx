import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PredictorListEntry } from './PredictorList';
import { PredictorList } from './PredictorList';

const mockPredictors: PredictorListEntry[] = [
  {
    predictor: {
      id: 'pred-A',
      userId: 'user-1',
      name: 'Alpha',
      createdAt: { toDate: () => new Date() } as never,
    },
  },
  {
    predictor: {
      id: 'pred-B',
      userId: 'user-1',
      name: 'Beta',
      createdAt: { toDate: () => new Date() } as never,
    },
  },
];

const onSelect = vi.fn();
const onEdit = vi.fn();
const onDelete = vi.fn();
const onCreate = vi.fn();

const defaultProps = {
  predictors: mockPredictors,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
};

describe('PredictorList', () => {
  describe('active modifier (D-06)', () => {
    it('PROF-active-1: applies predictor-list__card--active to the matching card only', () => {
      render(<PredictorList {...defaultProps} activeId="pred-A" />);
      const alphaCard = screen.getByRole('button', { name: 'Edit predictions for Alpha' });
      const betaCard = screen.getByRole('button', { name: 'Edit predictions for Beta' });
      expect(alphaCard.classList.contains('predictor-list__card--active')).toBe(true);
      expect(betaCard.classList.contains('predictor-list__card--active')).toBe(false);
    });

    it('PROF-active-2: no card has the active modifier when activeId is undefined', () => {
      render(<PredictorList {...defaultProps} />);
      const alphaCard = screen.getByRole('button', { name: 'Edit predictions for Alpha' });
      const betaCard = screen.getByRole('button', { name: 'Edit predictions for Beta' });
      expect(alphaCard.classList.contains('predictor-list__card--active')).toBe(false);
      expect(betaCard.classList.contains('predictor-list__card--active')).toBe(false);
    });

    it('PROF-active-3: active modifier moves to the newly-active card on re-render', () => {
      const { rerender } = render(<PredictorList {...defaultProps} activeId="pred-A" />);
      expect(
        screen
          .getByRole('button', { name: 'Edit predictions for Alpha' })
          .classList.contains('predictor-list__card--active'),
      ).toBe(true);

      rerender(<PredictorList {...defaultProps} activeId="pred-B" />);
      expect(
        screen
          .getByRole('button', { name: 'Edit predictions for Alpha' })
          .classList.contains('predictor-list__card--active'),
      ).toBe(false);
      expect(
        screen
          .getByRole('button', { name: 'Edit predictions for Beta' })
          .classList.contains('predictor-list__card--active'),
      ).toBe(true);
    });
  });

  describe('callback smoke tests', () => {
    it('calls onSelect with the correct predictor id when a card is clicked', () => {
      onSelect.mockClear();
      render(<PredictorList {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Edit predictions for Alpha' }));
      expect(onSelect).toHaveBeenCalledWith('pred-A');
    });

    it('calls onEdit with the correct predictor id when edit button is clicked', () => {
      onEdit.mockClear();
      render(<PredictorList {...defaultProps} />);
      const editButtons = screen.getAllByRole('button', {
        name: /Edit name and avatar for Alpha/i,
      });
      fireEvent.click(editButtons[0]);
      expect(onEdit).toHaveBeenCalledWith('pred-A');
    });

    it('calls onDelete with the correct predictor id when delete button is clicked', () => {
      onDelete.mockClear();
      render(<PredictorList {...defaultProps} />);
      const deleteButton = screen.getByRole('button', { name: /Delete Alpha/i });
      fireEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledWith('pred-A');
    });
  });

  describe('stat grid', () => {
    const mockEntryWithStats: PredictorListEntry = {
      predictor: {
        id: 'pred-C',
        userId: 'user-1',
        name: 'Gamma',
        createdAt: { toDate: () => new Date() } as never,
      },
      stats: {
        totalPoints: 42,
        accuracy: 0.75,
        currentStreak: 3,
        maxStreak: 5,
        exactBets: 7,
        totalBets: 10,
        finishedBets: 8,
      },
    };

    const mockEntryZeroTotalBets: PredictorListEntry = {
      predictor: {
        id: 'pred-D',
        userId: 'user-1',
        name: 'Delta',
        createdAt: { toDate: () => new Date() } as never,
      },
      stats: {
        totalPoints: 0,
        accuracy: 0,
        currentStreak: 0,
        maxStreak: 0,
        exactBets: 0,
        totalBets: 0,
        finishedBets: 0,
      },
    };

    const mockEntryWithBadges: PredictorListEntry = {
      predictor: {
        id: 'pred-E',
        userId: 'user-1',
        name: 'Epsilon',
        createdAt: { toDate: () => new Date() } as never,
      },
      badgesAwarded: { first_bet: '2026-06-01' },
    };

    const statGridTranslations = {
      statGrid: {
        statPoints: 'Pts',
        statAccuracy: 'Acc',
        statCurrentStreak: 'Streak',
        statBestStreak: 'Best',
        statExactBets: 'Exact',
        statGroups: 'Groups',
        statPointsAriaLabel: 'Points: {value}',
        statAccuracyAriaLabel: 'Accuracy: {value}',
        statCurrentStreakAriaLabel: 'Current streak: {value}',
        statBestStreakAriaLabel: 'Best streak: {value}',
        statExactBetsAriaLabel: 'Exact bets: {value}',
      },
    };

    it('renders predictor-list__stat-grid element when stats prop is provided', () => {
      const { container } = render(
        <PredictorList
          predictors={[mockEntryWithStats]}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
          translations={statGridTranslations}
        />,
      );
      expect(container.querySelector('.predictor-list__stat-grid')).not.toBeNull();
    });

    it('renders — for accuracy when totalBets === 0', () => {
      render(
        <PredictorList
          predictors={[mockEntryZeroTotalBets]}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
          translations={statGridTranslations}
        />,
      );
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders 75% when accuracy=0.75 and totalBets=10', () => {
      render(
        <PredictorList
          predictors={[mockEntryWithStats]}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
          translations={statGridTranslations}
        />,
      );
      expect(screen.getByText('75%')).toBeTruthy();
    });

    it('renders 0 for totalPoints when stats.totalPoints === 0', () => {
      const { container } = render(
        <PredictorList
          predictors={[mockEntryZeroTotalBets]}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
          translations={statGridTranslations}
        />,
      );
      const statValues = container.querySelectorAll('.predictor-list__stat-value');
      const pointsValue = statValues[0];
      expect(pointsValue?.textContent).toBe('0');
    });

    it('predictor-list__card-badges is present in the DOM when badgesAwarded provided', () => {
      const { container } = render(
        <PredictorList
          predictors={[mockEntryWithBadges]}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />,
      );
      expect(container.querySelector('.predictor-list__card-badges')).not.toBeNull();
    });
  });
});
