import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Info">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
  });

  it('hides tooltip on unhover', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    await userEvent.unhover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class', async () => {
    render(
      <Tooltip content="Text" position="bottom">
        <button>Hover</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveClass('tooltip--bottom');
  });
});
