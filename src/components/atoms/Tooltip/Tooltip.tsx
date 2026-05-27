import type { FC, ReactNode } from 'react';
import { useState } from 'react';

import './Tooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`tooltip tooltip--${position}`} role="tooltip">
          {content}
        </span>
      )}
    </div>
  );
};
