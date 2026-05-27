import type { FC } from 'react';

import './Spinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`spinner spinner--${size} ${className}`} role="status" aria-label="Loading" />
  );
};
