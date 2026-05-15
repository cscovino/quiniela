import React from 'react';
import './Divider.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  return <div className={`divider divider--${orientation} ${className}`} role="separator" />;
};
