import type { FC } from 'react';

import './Divider.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  return <div className={`divider divider--${orientation} ${className}`} role="separator" />;
};
