import React from 'react';
import './PixelArt.css';

export type PixelArtName =
  | 'football'
  | 'trophy'
  | 'stadium'
  | 'whistle'
  | 'star'
  | 'goal'
  | 'empty'
  | 'medal-gold'
  | 'medal-silver'
  | 'medal-bronze'
  | 'ball-kick'
  | 'referee'
  | 'crowd';

export interface PixelArtProps {
  name: PixelArtName;
  size?: number;
  className?: string;
  animated?: boolean;
}

const spriteMap: Record<PixelArtName, React.ReactNode> = {
  football: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="4" height="2" />
      <rect x="4" y="4" width="8" height="2" />
      <rect x="2" y="6" width="12" height="4" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect
        x="5"
        y="5"
        width="2"
        height="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <rect
        x="9"
        y="5"
        width="2"
        height="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <rect
        x="5"
        y="9"
        width="2"
        height="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <rect
        x="9"
        y="9"
        width="2"
        height="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="1" />
      <rect x="5" y="2" width="6" height="1" />
      <rect x="4" y="3" width="8" height="1" />
      <rect x="4" y="4" width="8" height="4" />
      <rect x="3" y="5" width="1" height="2" />
      <rect x="12" y="5" width="1" height="2" />
      <rect x="6" y="8" width="4" height="1" />
      <rect x="7" y="9" width="2" height="1" />
      <rect x="5" y="10" width="6" height="1" />
      <rect x="4" y="11" width="8" height="1" />
      <rect x="6" y="12" width="4" height="1" />
      <rect x="5" y="13" width="6" height="1" />
      <rect x="4" y="14" width="8" height="1" />
    </svg>
  ),
  stadium: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="14" height="2" />
      <rect x="2" y="6" width="12" height="2" />
      <rect x="3" y="8" width="10" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="7" y="2" width="2" height="2" opacity="0.5" />
      <rect x="3" y="3" width="1" height="1" opacity="0.3" />
      <rect x="12" y="3" width="1" height="1" opacity="0.3" />
      <rect x="5" y="5" width="1" height="1" opacity="0.3" />
      <rect x="10" y="5" width="1" height="1" opacity="0.3" />
    </svg>
  ),
  whistle: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="6" height="4" />
      <rect x="8" y="5" width="2" height="6" />
      <rect x="10" y="7" width="4" height="2" />
      <rect x="3" y="7" width="4" height="2" opacity="0.5" />
      <rect x="12" y="6" width="2" height="4" opacity="0.7" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="1" width="2" height="2" />
      <rect x="6" y="3" width="4" height="2" />
      <rect x="1" y="5" width="14" height="2" />
      <rect x="2" y="7" width="12" height="2" />
      <rect x="3" y="9" width="10" height="2" />
      <rect x="4" y="11" width="8" height="2" />
      <rect x="5" y="13" width="6" height="2" />
      <rect x="6" y="15" width="4" height="1" />
    </svg>
  ),
  goal: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="14" height="2" />
      <rect x="1" y="4" width="2" height="10" />
      <rect x="13" y="4" width="2" height="10" />
      <rect x="3" y="6" width="10" height="1" opacity="0.3" />
      <rect x="3" y="8" width="10" height="1" opacity="0.3" />
      <rect x="3" y="10" width="10" height="1" opacity="0.3" />
      <rect x="5" y="6" width="1" height="6" opacity="0.3" />
      <rect x="7" y="6" width="1" height="6" opacity="0.3" />
      <rect x="9" y="6" width="1" height="6" opacity="0.3" />
      <rect x="11" y="6" width="1" height="6" opacity="0.3" />
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="8" height="8" opacity="0.3" />
      <rect x="6" y="6" width="4" height="4" opacity="0.5" />
      <rect x="7" y="7" width="2" height="2" opacity="0.7" />
    </svg>
  ),
  'medal-gold': (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="4" y="6" width="8" height="6" />
      <rect x="5" y="7" width="6" height="4" opacity="0.5" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="5" y="14" width="6" height="1" />
    </svg>
  ),
  'medal-silver': (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="4" y="6" width="8" height="6" />
      <rect x="5" y="7" width="6" height="4" opacity="0.5" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="5" y="14" width="6" height="1" />
    </svg>
  ),
  'medal-bronze': (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="4" y="6" width="8" height="6" />
      <rect x="5" y="7" width="6" height="4" opacity="0.5" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="5" y="14" width="6" height="1" />
    </svg>
  ),
  'ball-kick': (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="4" height="2" />
      <rect x="4" y="4" width="8" height="2" />
      <rect x="2" y="6" width="12" height="4" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="10" y="4" width="2" height="1" opacity="0.5" />
      <rect x="12" y="5" width="2" height="1" opacity="0.5" />
      <rect x="13" y="6" width="2" height="2" opacity="0.5" />
    </svg>
  ),
  referee: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" />
      <rect x="5" y="4" width="6" height="1" />
      <rect x="5" y="5" width="6" height="5" />
      <rect x="7" y="6" width="2" height="3" opacity="0.5" />
      <rect x="5" y="10" width="2" height="4" />
      <rect x="9" y="10" width="2" height="4" />
      <rect x="12" y="6" width="2" height="3" opacity="0.7" />
      <rect x="13" y="5" width="1" height="1" opacity="0.5" />
    </svg>
  ),
  crowd: (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="2" height="3" opacity="0.6" />
      <rect x="5" y="3" width="2" height="4" opacity="0.8" />
      <rect x="8" y="4" width="2" height="3" opacity="0.6" />
      <rect x="11" y="3" width="2" height="4" opacity="0.8" />
      <rect x="1" y="7" width="14" height="2" opacity="0.4" />
      <rect x="3" y="9" width="2" height="3" opacity="0.5" />
      <rect x="6" y="8" width="2" height="4" opacity="0.7" />
      <rect x="9" y="9" width="2" height="3" opacity="0.5" />
      <rect x="12" y="8" width="2" height="4" opacity="0.7" />
      <rect x="0" y="12" width="16" height="2" opacity="0.3" />
    </svg>
  ),
};

export const PixelArt: React.FC<PixelArtProps> = ({
  name,
  size = 32,
  className = '',
  animated = false,
}) => {
  const animationClass = animated
    ? name === 'trophy'
      ? 'pixel-art--glow'
      : name === 'star'
        ? 'pixel-art--bounce'
        : name === 'goal'
          ? 'pixel-art--celebrate'
          : 'pixel-art--pulse'
    : '';

  return (
    <div
      className={`pixel-art pixel-art--${name} ${animationClass} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={name}
    >
      {spriteMap[name]}
    </div>
  );
};
