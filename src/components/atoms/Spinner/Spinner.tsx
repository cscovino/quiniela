import type { FC } from 'react';

import { Icon } from '@atoms/Icon';

import './Spinner.css';

const SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
};

export type SpinnerSize = keyof typeof SIZES;

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <span className={`spinner ${className}`} role="status" aria-label="Loading">
      <Icon name="loader" size={SIZES[size]} />
    </span>
  );
};
