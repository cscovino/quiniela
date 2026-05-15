import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it('renders body text by default', () => {
    render(<Typography>Hello</Typography>);
    const el = screen.getByText('Hello');
    expect(el.tagName.toLowerCase()).toBe('p');
    expect(el).toHaveClass('typography--body');
  });

  it('renders h1 variant', () => {
    render(<Typography variant="h1">Title</Typography>);
    const el = screen.getByText('Title');
    expect(el.tagName.toLowerCase()).toBe('h1');
    expect(el).toHaveClass('typography--h1');
  });

  it('renders custom element with as prop', () => {
    render(
      <Typography variant="h1" as="div">
        Custom
      </Typography>,
    );
    expect(screen.getByText('Custom').tagName.toLowerCase()).toBe('div');
  });

  it('merges custom className', () => {
    render(<Typography className="custom">Text</Typography>);
    expect(screen.getByText('Text')).toHaveClass('custom');
  });
});
