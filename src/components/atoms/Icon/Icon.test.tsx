import { render, screen } from '@testing-library/react';

import { Icon } from './Icon';

describe('Icon', () => {
  it('renders icon with correct aria label', () => {
    render(<Icon name="trophy" />);
    const icon = screen.getByRole('img', { name: 'trophy' });
    expect(icon).toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(<Icon name="fire" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('applies custom color', () => {
    const { container } = render(<Icon name="target" color="#ff0000" />);
    const span = container.firstChild;
    expect(span).toHaveStyle({ '--icon-color': '#ff0000' });
  });

  it('renders all icon types', () => {
    const iconNames: Array<Parameters<typeof Icon>[0]['name']> = [
      'football',
      'trophy',
      'star',
      'fire',
      'lightning',
      'target',
      'chart',
      'bell',
      'user',
      'flag',
      'check',
      'x',
      'clock',
      'live',
    ];

    iconNames.forEach((name) => {
      const { container } = render(<Icon name={name} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
