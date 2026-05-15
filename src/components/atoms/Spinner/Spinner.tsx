import React from 'react';
import './Spinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 32 };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      role="status"
      aria-label="Loading"
    />
  );
};
