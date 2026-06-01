import { Bell } from 'pixelarticons/react/Bell';
import { Chart } from 'pixelarticons/react/Chart';
import { Check } from 'pixelarticons/react/Check';
import { ChevronDown2 } from 'pixelarticons/react/ChevronDown2';
import { ChevronLeft } from 'pixelarticons/react/ChevronLeft';
import { ChevronRight2 } from 'pixelarticons/react/ChevronRight2';
import { ChevronUp2 } from 'pixelarticons/react/ChevronUp2';
import { Clock } from 'pixelarticons/react/Clock';
import { Close } from 'pixelarticons/react/Close';
import { Crown } from 'pixelarticons/react/Crown';
import { Eye } from 'pixelarticons/react/Eye';
import { Fire } from 'pixelarticons/react/Fire';
import { Flag } from 'pixelarticons/react/Flag';
import { Gamepad } from 'pixelarticons/react/Gamepad';
import { InfoBox } from 'pixelarticons/react/InfoBox';
import { Login } from 'pixelarticons/react/Login';
import { Logout } from 'pixelarticons/react/Logout';
import { Menu } from 'pixelarticons/react/Menu';
import { Moon } from 'pixelarticons/react/Moon';
import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Plus } from 'pixelarticons/react/Plus';
import { Radio } from 'pixelarticons/react/Radio';
import { Robot } from 'pixelarticons/react/Robot';
import { Shuffle } from 'pixelarticons/react/Shuffle';
import { Sparkle } from 'pixelarticons/react/Sparkle';
import { SquareAlert } from 'pixelarticons/react/SquareAlert';
import { Target } from 'pixelarticons/react/Target';
import { Trash } from 'pixelarticons/react/Trash';
import { Trophy } from 'pixelarticons/react/Trophy';
import { User } from 'pixelarticons/react/User';
import { Zap } from 'pixelarticons/react/Zap';
import type { CSSProperties, FC } from 'react';

import './Icon.css';

export type IconName =
  | 'award'
  | 'bell'
  | 'chart'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'clock'
  | 'close'
  | 'crown'
  | 'eye'
  | 'fire'
  | 'flag'
  | 'football'
  | 'info'
  | 'lightning'
  | 'live'
  | 'login'
  | 'logout'
  | 'menu'
  | 'moon'
  | 'pen-square'
  | 'plus'
  | 'robot'
  | 'shuffle'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'trash'
  | 'trophy'
  | 'user'
  | 'warning'
  | 'x'
  | 'zap';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap: Record<IconName, FC<{ size?: number; color?: string; className?: string }>> = {
  award: Crown,
  bell: Bell,
  chart: Chart,
  check: Check,
  'chevron-down': ChevronDown2,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight2,
  'chevron-up': ChevronUp2,
  clock: Clock,
  close: Close,
  crown: Crown,
  eye: Eye,
  fire: Fire,
  flag: Flag,
  football: Gamepad,
  info: InfoBox,
  lightning: Zap,
  live: Radio,
  login: Login,
  logout: Logout,
  menu: Menu,
  moon: Moon,
  'pen-square': PenSquare,
  plus: Plus,
  robot: Robot,
  shuffle: Shuffle,
  sparkles: Sparkle,
  star: Sparkle,
  target: Target,
  trash: Trash,
  trophy: Trophy,
  user: User,
  warning: SquareAlert,
  x: Close,
  zap: Zap,
};

export const Icon: FC<IconProps> = ({ name, size = 24, color, className = '' }) => {
  const Component = iconMap[name];

  return (
    <span
      className={`icon ${className}`}
      style={color ? ({ '--icon-color': color } as CSSProperties) : undefined}
      role="img"
      aria-label={name}
    >
      <Component width={size} height={size} />
    </span>
  );
};
