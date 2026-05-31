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
      const editButtons = screen.getAllByRole('button', { name: /Edit name and avatar for Alpha/i });
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
});
