import React from 'react';
import {
  Trophy,
  Fire,
  Zap,
  Target,
  Chart,
  Bell,
  User,
  Flag,
  Check,
  Clock,
  Radio,
  SectionX,
  Gamepad,
  Sparkle,
  Crown,
} from 'pixelarticons/react';
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
  | 'live'
  | 'award'
  | 'crown';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap: Record<IconName, React.FC<{ size?: number; color?: string; className?: string }>> = {
  football: Gamepad,
  trophy: Trophy,
  star: Sparkle,
  fire: Fire,
  lightning: Zap,
  target: Target,
  chart: Chart,
  bell: Bell,
  user: User,
  flag: Flag,
  check: Check,
  x: SectionX,
  clock: Clock,
  live: Radio,
  award: Crown,
  crown: Crown,
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, className = '' }) => {
  const Component = iconMap[name];

  return (
    <span className={`icon ${className}`} style={{ color }} role="img" aria-label={name}>
      <Component width={size} height={size} />
    </span>
  );
};
