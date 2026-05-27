import { Bell } from 'pixelarticons/react/Bell';
import { Chart } from 'pixelarticons/react/Chart';
import { Check } from 'pixelarticons/react/Check';
import { ChevronLeft } from 'pixelarticons/react/ChevronLeft';
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
import { RobotFace } from 'pixelarticons/react/RobotFace';
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
  | 'bell'
  | 'chart'
  | 'check'
  | 'chevron-left'
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
  | 'robot-face'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'trash'
  | 'trophy'
  | 'user'
  | 'warning'
  | 'x';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap: Record<IconName, FC<{ size?: number; color?: string; className?: string }>> = {
  bell: Bell,
  chart: Chart,
  check: Check,
  'chevron-left': ChevronLeft,
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
  'robot-face': RobotFace,
  sparkles: Sparkle,
  star: Sparkle,
  target: Target,
  trash: Trash,
  trophy: Trophy,
  user: User,
  warning: SquareAlert,
  x: Close,
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
