import React from 'react';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', className = '' }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      aria-label={alt || name}
    >
      {src ? <img src={src} alt={alt || name} /> : <span>{initials}</span>}
    </div>
  );
};
