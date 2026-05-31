/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Predictor } from '@app-types/firestore';
import { generateAvatarDataUri } from '@utils/dicebear';

import { PredictorAvatar } from './PredictorAvatar';

const makePredictor = (overrides: Partial<Predictor> = {}): Predictor => ({
  id: 'user-1-default',
  userId: 'user-1',
  name: 'Default',
  createdAt: new Date() as any,
  ...overrides,
});

describe('PredictorAvatar', () => {
  it('tier-1: renders pixel-art img from predictor.pixelArt seed and options', () => {
    render(
      <PredictorAvatar predictor={makePredictor({ pixelArt: { seed: 'seed-1', options: {} } })} />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', expect.stringMatching(/^data:image\/svg\+xml/));
    expect(img).toHaveAttribute('src', generateAvatarDataUri('seed-1', {}));
    expect(img).toHaveAttribute('alt', 'Default');
  });

  it('tier-2: renders pixel-art img seeded from predictor.id (byte-identical determinism)', () => {
    render(<PredictorAvatar predictor={makePredictor({ id: 'abc123', name: 'Carlos' })} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', generateAvatarDataUri('abc123'));
    expect(img).toHaveAttribute('alt', 'Carlos');
  });

  it('tier-3: renders colored initial when no id', () => {
    render(<PredictorAvatar predictor={makePredictor({ id: '', name: 'Carlos' })} />);

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByLabelText('Carlos')).toBeInTheDocument();
  });

  it('renders ? for empty name', () => {
    render(<PredictorAvatar predictor={makePredictor({ id: '', name: '' })} />);

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

  it('renders with custom className', () => {
    const { container } = render(
      <PredictorAvatar predictor={makePredictor()} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
