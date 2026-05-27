import { render, screen } from '@testing-library/react';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders with image', () => {
    render(<Avatar src="/test.jpg" alt="User" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test.jpg');
  });

  it('renders initials when no image', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial for single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders ? when no name or image', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(<Avatar size="lg" name="Test" />);
    expect(screen.getByLabelText('Test')).toHaveClass('avatar--lg');
  });

  it('limits initials to 2 characters', () => {
    render(<Avatar name="John Jacob Smith" />);
    expect(screen.getByText('JJ')).toBeInTheDocument();
  });
});
