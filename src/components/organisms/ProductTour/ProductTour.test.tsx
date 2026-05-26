import { render } from '@testing-library/react';
import { ProductTour, resetTour } from './ProductTour';

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({
    drive: vi.fn(),
    destroy: vi.fn(),
  })),
}));

describe('ProductTour', () => {
  const mockSteps = [
    { element: '#test-element', title: 'Step 1', description: 'Description 1' },
    { element: '#test-element-2', title: 'Step 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing when given empty steps array', () => {
    const { container } = render(<ProductTour tourId="test-tour" steps={[]} />);
    expect(container.querySelector('.product-tour')).toBeInTheDocument();
  });

  it('renders without crashing when given valid tour steps', () => {
    const { container } = render(<ProductTour tourId="test-tour" steps={mockSteps} />);
    expect(container.querySelector('.product-tour')).toBeInTheDocument();
  });

  it('does not render when tour is already completed', () => {
    localStorage.setItem('tour_completed_test-tour', 'true');
    const { container } = render(<ProductTour tourId="test-tour" steps={mockSteps} />);
    expect(container.querySelector('.product-tour')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProductTour tourId="test-tour" steps={mockSteps} className="custom-class" />,
    );
    expect(container.querySelector('.product-tour.custom-class')).toBeInTheDocument();
  });

  it('sets data-tour-id attribute', () => {
    const { container } = render(<ProductTour tourId="my-tour-id" steps={mockSteps} />);
    expect(container.querySelector('[data-tour-id="my-tour-id"]')).toBeInTheDocument();
  });

  it('resetTour removes completion flag from localStorage', () => {
    localStorage.setItem('tour_completed_my-tour', 'true');
    expect(localStorage.getItem('tour_completed_my-tour')).toBe('true');
    resetTour('my-tour');
    expect(localStorage.getItem('tour_completed_my-tour')).toBeNull();
  });
});
