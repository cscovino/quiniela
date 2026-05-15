import React from 'react';
import './ProgressBar.css';

export type ProgressBarVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`progress-bar ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="progress-bar__label">{Math.round(percentage)}%</span>}
    </div>
  );
};
