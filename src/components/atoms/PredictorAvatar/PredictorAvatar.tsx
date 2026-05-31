import type { FC } from 'react';
import { useMemo } from 'react';

import type { Predictor } from '@app-types/firestore';
import { DEFAULT_OPTIONS, generateAvatarDataUri } from '@utils/dicebear';

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
  // D-07: pure inline tier resolver
  const seed = predictor.pixelArt?.seed ?? predictor.id;
  const options = predictor.pixelArt?.options ?? DEFAULT_OPTIONS;
  const isImage = Boolean(seed); // tiers 1 & 2 (real predictors always have id)

  // D-05 / RESEARCH Q2 + Pitfall 2: serialized options key for cache correctness
  const optionsKey = JSON.stringify(options);

  // Reference only optionsKey in the closure (parse back inside) so the memo deps are
  // exhaustive — `options` is an unstable object reference, optionsKey is its stable proxy.
  const dataUri = useMemo(
    () => (isImage ? generateAvatarDataUri(seed, JSON.parse(optionsKey)) : ''),
    [seed, optionsKey, isImage],
  );

  if (isImage) {
    return (
      <div className={`predictor-avatar predictor-avatar--${size} ${className}`}>
        <img className="predictor-avatar__img" src={dataUri} alt={predictor.name ?? ''} />
      </div>
    );
  }

  // tier-3 (no id): keep current colored-initial behavior verbatim (D-04)
  const initial = predictor.name ? predictor.name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className={`predictor-avatar predictor-avatar--${size} ${className}`}
      style={{ backgroundColor: getFallbackColor(predictor.name || predictor.id || '?') }}
      aria-label={predictor.name || 'Predictor avatar'}
      role="img"
    >
      <span className="predictor-avatar__initial" aria-hidden="true">
        {initial}
      </span>
    </div>
  );
};
