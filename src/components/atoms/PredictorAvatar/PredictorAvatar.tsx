import type { FC } from 'react';

import type { Predictor } from '@app-types/firestore';

import './PredictorAvatar.css';

export type PredictorAvatarSize = 'sm' | 'md' | 'lg';

export interface PredictorAvatarProps {
  predictor: Predictor;
  size?: PredictorAvatarSize;
  className?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

const FALLBACK_COLORS = [
  '#E63946',
  '#2D6A4F',
  '#06D6A0',
  '#7B2D8E',
  '#F4A261',
  '#D4AF37',
  '#1D3557',
  '#457B9D',
  '#A8DADC',
  '#E76F51',
  '#264653',
  '#6A0572',
];

function getFallbackColor(id: string): string {
  const hash = hashString(id);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export const PredictorAvatar: FC<PredictorAvatarProps> = ({
  predictor,
  size = 'md',
  className = '',
}) => {
  const hasAvatar = predictor.avatar?.emoji && predictor.avatar?.bgColor;
  const bgColor = hasAvatar ? predictor.avatar!.bgColor : getFallbackColor(predictor.id);
  const emoji = hasAvatar ? predictor.avatar!.emoji : '';
  const initial = predictor.name ? predictor.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`predictor-avatar predictor-avatar--${size} ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-label={predictor.name || 'Predictor avatar'}
      role="img"
    >
      {emoji ? (
        <span className="predictor-avatar__emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : (
        <span className="predictor-avatar__initial">{initial}</span>
      )}
    </div>
  );
};
