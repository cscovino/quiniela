/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Predictor } from '@app-types/firestore';

import { PredictorAvatar } from './PredictorAvatar';

const makePredictor = (overrides: Partial<Predictor> = {}): Predictor => ({
  id: 'user-1-default',
  userId: 'user-1',
  name: 'Default',
  createdAt: new Date() as any,
  ...overrides,
});

describe('PredictorAvatar', () => {
  it('renders emoji avatar when avatar is set', () => {
    render(
      <PredictorAvatar
        predictor={makePredictor({
          avatar: { bgColor: '#ff0000', emoji: '⚽' },
        })}
      />,
    );

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('aria-label', 'Default');
    expect(avatar).toHaveStyle({ backgroundColor: '#ff0000' });
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('renders fallback color + initial when no avatar', () => {
    render(<PredictorAvatar predictor={makePredictor({ id: 'abc123', name: 'Carlos' })} />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('aria-label', 'Carlos');
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('renders ? for empty name', () => {
    render(<PredictorAvatar predictor={makePredictor({ name: '' })} />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container: sm } = render(<PredictorAvatar predictor={makePredictor()} size="sm" />);
    const { container: md } = render(<PredictorAvatar predictor={makePredictor()} size="md" />);
    const { container: lg } = render(<PredictorAvatar predictor={makePredictor()} size="lg" />);

    expect(sm.firstChild).toHaveClass('predictor-avatar--sm');
    expect(md.firstChild).toHaveClass('predictor-avatar--md');
    expect(lg.firstChild).toHaveClass('predictor-avatar--lg');
  });

  it('uses deterministic color from id', () => {
    const { container: c1 } = render(
      <PredictorAvatar predictor={makePredictor({ id: 'same-id' })} />,
    );
    const { container: c2 } = render(
      <PredictorAvatar predictor={makePredictor({ id: 'same-id' })} />,
    );

    expect(c1.firstChild).toHaveStyle({
      backgroundColor: (c2.firstChild as HTMLElement).style.backgroundColor,
    });
  });

  it('handles two-grapheme emoji', () => {
    render(
      <PredictorAvatar
        predictor={makePredictor({
          avatar: { bgColor: '#2D6A4F', emoji: '🇦🇷' },
        })}
      />,
    );

    expect(screen.getByText('🇦🇷')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <PredictorAvatar predictor={makePredictor()} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
