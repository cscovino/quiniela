import React from 'react';
import './Badge.css';

export type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  return <span className={`badge badge--${variant} badge--${size} ${className}`}>{children}</span>;
};
