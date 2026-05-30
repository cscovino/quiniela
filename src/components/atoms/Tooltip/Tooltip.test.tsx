import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Info">
        <span>Trigger</span>
      </Tooltip>,
    );
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('shows tooltip on hover and hides on unhover', async () => {
    render(
      <Tooltip content="Tooltip text">
        <span>Trigger</span>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Tooltip text' });
    await userEvent.hover(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
    await userEvent.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on tap and dismisses on outside tap (touch)', async () => {
    render(
      <Tooltip content="Tooltip text">
        <span>Trigger</span>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Tooltip text' });
    await userEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
    // Tapping elsewhere closes it.
    await userEvent.click(document.body);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class', async () => {
    render(
      <Tooltip content="Text" position="bottom">
        <span>Trigger</span>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'Text' }));
    expect(screen.getByRole('tooltip')).toHaveClass('tooltip--bottom');
  });
});
