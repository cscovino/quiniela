import { Bell } from 'pixelarticons/react/Bell';
import { Chart } from 'pixelarticons/react/Chart';
import { Check } from 'pixelarticons/react/Check';
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
import { Radio } from 'pixelarticons/react/Radio';
import { Sparkle } from 'pixelarticons/react/Sparkle';
import { SquareAlert } from 'pixelarticons/react/SquareAlert';
import { Target } from 'pixelarticons/react/Target';
import { Trophy } from 'pixelarticons/react/Trophy';
import { User } from 'pixelarticons/react/User';
import { Zap } from 'pixelarticons/react/Zap';
import type { CSSProperties, FC } from 'react';

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
  | 'crown'
  | 'menu'
  | 'login'
  | 'logout'
  | 'close'
  | 'info'
  | 'warning'
  | 'eye';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap: Record<IconName, FC<{ size?: number; color?: string; className?: string }>> = {
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
  x: Close,
  clock: Clock,
  live: Radio,
  award: Crown,
  crown: Crown,
  menu: Menu,
  close: Close,
  login: Login,
  logout: Logout,
  info: InfoBox,
  warning: SquareAlert,
  eye: Eye,
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
