import React from 'react';
import './Icon.css';

export type IconName =
  | 'football'
  | 'trophy'
  | 'star'
  | 'fire'
  | 'lightning'
  | 'target'
  | 'chart'
  | 'bell'
  | 'user'
  | 'flag'
  | 'check'
  | 'x'
  | 'clock'
  | 'live';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const icons: Record<IconName, string> = {
  football: '⚽',
  trophy: '🏆',
  star: '⭐',
  fire: '🔥',
  lightning: '⚡',
  target: '🎯',
  chart: '📊',
  bell: '🔔',
  user: '👤',
  flag: '🏁',
  check: '✓',
  x: '✕',
  clock: '🕒',
  live: '🔴',
};

export const Icon: React.FC<IconProps> = ({ name, size = 16, color, className = '' }) => {
  return (
    <span
      className={`icon ${className}`}
      style={{ fontSize: size, color }}
      role="img"
      aria-label={name}
    >
      {icons[name]}
    </span>
  );
};
