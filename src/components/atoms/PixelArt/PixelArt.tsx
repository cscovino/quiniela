import type { CSSProperties, FC, ReactNode } from 'react';

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
  | 'crowd'
  | 'podium'
  | 'boot'
  | 'jersey'
  | 'flag'
  | 'cards'
  | 'fireworks'
  | 'confetti';

export interface PixelArtProps {
  name: PixelArtName;
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * Shared palette for the pixel-art sprites. Colours are baked into each sprite
 * (rather than relying on `currentColor`) so a single icon can read as a real
 * object — a green-and-gold World Cup trophy, a ribboned medal, etc.
 */
const P = {
  ballWhite: '#fbf8ef',
  ballShade: '#d9d3c2',
  ink: '#2b2a3a',
  inkSoft: '#46455c',
  goldLight: '#f3da78',
  gold: '#e3b94a',
  goldDark: '#b07f1e',
  silverLight: '#edeef2',
  silver: '#c2c4cf',
  silverDark: '#8a8c99',
  bronzeLight: '#e6a25f',
  bronze: '#cd7f32',
  bronzeDark: '#9a5a22',
  green: '#2e8b57',
  greenDark: '#1f6d42',
  grass: '#42a85f',
  grassDark: '#2f7d45',
  stand: '#a7adba',
  standDark: '#6c727f',
  ribbonRed: '#d6493b',
  ribbonBlue: '#3a5a8c',
  white: '#fbf8ef',
} as const;

/**
 * A medal sprite: crossed red/blue ribbon straps above a shaded metal disc with
 * a small star highlight. Parameterised by metal tone so gold / silver / bronze
 * share one shape but read distinctly.
 */
const medal = (light: string, mid: string, dark: string): ReactNode => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    {/* ribbon straps */}
    <rect x="4" y="0" width="2" height="2" fill={P.ribbonRed} />
    <rect x="5" y="2" width="2" height="2" fill={P.ribbonRed} />
    <rect x="6" y="4" width="2" height="1" fill={P.ribbonRed} />
    <rect x="10" y="0" width="2" height="2" fill={P.ribbonBlue} />
    <rect x="9" y="2" width="2" height="2" fill={P.ribbonBlue} />
    <rect x="8" y="4" width="2" height="1" fill={P.ribbonBlue} />
    {/* disc rim */}
    <rect x="6" y="5" width="4" height="1" fill={dark} />
    <rect x="5" y="6" width="6" height="1" fill={dark} />
    <rect x="4" y="7" width="8" height="3" fill={dark} />
    <rect x="5" y="10" width="6" height="1" fill={dark} />
    <rect x="6" y="11" width="4" height="1" fill={dark} />
    {/* disc face */}
    <rect x="6" y="6" width="4" height="1" fill={mid} />
    <rect x="5" y="7" width="6" height="3" fill={mid} />
    <rect x="6" y="10" width="4" height="1" fill={mid} />
    {/* star highlight */}
    <rect x="7" y="6" width="2" height="1" fill={light} />
    <rect x="6" y="7" width="4" height="1" fill={light} />
    <rect x="7" y="8" width="2" height="1" fill={light} />
  </svg>
);

const spriteMap: Record<PixelArtName, ReactNode> = {
  football: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* ball body */}
      <rect x="6" y="1" width="4" height="1" fill={P.ballShade} />
      <rect x="4" y="2" width="8" height="1" fill={P.ballWhite} />
      <rect x="3" y="3" width="10" height="1" fill={P.ballWhite} />
      <rect x="2" y="4" width="12" height="8" fill={P.ballWhite} />
      <rect x="3" y="12" width="10" height="1" fill={P.ballWhite} />
      <rect x="4" y="13" width="8" height="1" fill={P.ballShade} />
      <rect x="6" y="14" width="4" height="1" fill={P.ballShade} />
      {/* shading on lower-right edge */}
      <rect x="11" y="10" width="2" height="2" fill={P.ballShade} />
      {/* centre pentagon */}
      <rect x="7" y="4" width="2" height="1" fill={P.ink} />
      <rect x="6" y="5" width="4" height="2" fill={P.ink} />
      <rect x="7" y="7" width="2" height="1" fill={P.ink} />
      {/* surrounding patches */}
      <rect x="3" y="7" width="2" height="2" fill={P.ink} />
      <rect x="11" y="7" width="2" height="2" fill={P.ink} />
      <rect x="6" y="10" width="2" height="2" fill={P.ink} />
      <rect x="9" y="3" width="2" height="1" fill={P.ink} />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* globe / world on top */}
      <rect x="6" y="0" width="4" height="1" fill={P.gold} />
      <rect x="5" y="1" width="6" height="2" fill={P.gold} />
      <rect x="6" y="3" width="4" height="1" fill={P.goldDark} />
      {/* figures / flared upper body */}
      <rect x="4" y="4" width="8" height="1" fill={P.gold} />
      <rect x="3" y="5" width="10" height="1" fill={P.gold} />
      <rect x="4" y="6" width="8" height="1" fill={P.gold} />
      <rect x="5" y="7" width="6" height="1" fill={P.gold} />
      {/* twisting waist */}
      <rect x="6" y="8" width="4" height="2" fill={P.gold} />
      <rect x="6" y="10" width="4" height="1" fill={P.goldDark} />
      {/* green malachite base bands */}
      <rect x="5" y="11" width="6" height="1" fill={P.green} />
      <rect x="4" y="12" width="8" height="1" fill={P.green} />
      <rect x="3" y="13" width="10" height="1" fill={P.greenDark} />
      {/* gold foot */}
      <rect x="4" y="14" width="8" height="1" fill={P.gold} />
      <rect x="5" y="15" width="6" height="1" fill={P.goldDark} />
      {/* shine highlights */}
      <rect x="6" y="1" width="1" height="1" fill={P.goldLight} />
      <rect x="4" y="5" width="1" height="2" fill={P.goldLight} />
      <rect x="7" y="8" width="1" height="2" fill={P.goldLight} />
    </svg>
  ),
  stadium: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* floodlights */}
      <rect x="1" y="0" width="3" height="2" fill={P.goldLight} />
      <rect x="12" y="0" width="3" height="2" fill={P.goldLight} />
      <rect x="2" y="2" width="1" height="2" fill={P.standDark} />
      <rect x="13" y="2" width="1" height="2" fill={P.standDark} />
      {/* outer bowl (stands) */}
      <rect x="5" y="3" width="6" height="1" fill={P.stand} />
      <rect x="3" y="4" width="10" height="1" fill={P.stand} />
      <rect x="2" y="5" width="12" height="1" fill={P.stand} />
      <rect x="1" y="6" width="14" height="4" fill={P.stand} />
      <rect x="2" y="10" width="12" height="1" fill={P.standDark} />
      <rect x="3" y="11" width="10" height="1" fill={P.standDark} />
      <rect x="5" y="12" width="6" height="1" fill={P.standDark} />
      {/* inner pitch */}
      <rect x="5" y="5" width="6" height="1" fill={P.grass} />
      <rect x="4" y="6" width="8" height="3" fill={P.grass} />
      <rect x="5" y="9" width="6" height="1" fill={P.grassDark} />
      {/* pitch markings */}
      <rect x="8" y="6" width="1" height="3" fill={P.white} />
      <rect x="7" y="7" width="3" height="1" fill={P.white} />
    </svg>
  ),
  whistle: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* body */}
      <rect x="2" y="6" width="6" height="1" fill={P.silverLight} />
      <rect x="1" y="7" width="8" height="3" fill={P.silver} />
      <rect x="2" y="10" width="6" height="1" fill={P.silverDark} />
      {/* mouthpiece */}
      <rect x="9" y="6" width="3" height="2" fill={P.silver} />
      <rect x="11" y="6" width="3" height="1" fill={P.silverLight} />
      {/* pea hole */}
      <rect x="4" y="8" width="2" height="2" fill={P.ink} />
      {/* ring */}
      <rect x="0" y="8" width="1" height="1" fill={P.silverDark} />
    </svg>
  ),
  star: (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
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
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* frame */}
      <rect x="1" y="2" width="14" height="2" fill={P.white} />
      <rect x="1" y="4" width="2" height="10" fill={P.white} />
      <rect x="13" y="4" width="2" height="10" fill={P.white} />
      {/* net mesh */}
      <rect x="4" y="5" width="8" height="1" fill={P.standDark} opacity="0.45" />
      <rect x="4" y="8" width="8" height="1" fill={P.standDark} opacity="0.45" />
      <rect x="4" y="11" width="8" height="1" fill={P.standDark} opacity="0.45" />
      <rect x="5" y="5" width="1" height="7" fill={P.standDark} opacity="0.45" />
      <rect x="8" y="5" width="1" height="7" fill={P.standDark} opacity="0.45" />
      <rect x="11" y="5" width="1" height="7" fill={P.standDark} opacity="0.45" />
      {/* ball in the net */}
      <rect x="6" y="9" width="3" height="3" fill={P.ballWhite} />
      <rect x="7" y="10" width="1" height="1" fill={P.ink} />
    </svg>
  ),
  empty: (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect x="4" y="4" width="8" height="8" opacity="0.3" />
      <rect x="6" y="6" width="4" height="4" opacity="0.5" />
      <rect x="7" y="7" width="2" height="2" opacity="0.7" />
    </svg>
  ),
  'medal-gold': medal(P.goldLight, P.gold, P.goldDark),
  'medal-silver': medal(P.silverLight, P.silver, P.silverDark),
  'medal-bronze': medal(P.bronzeLight, P.bronze, P.bronzeDark),
  'ball-kick': (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* speeding ball */}
      <rect x="5" y="3" width="4" height="1" fill={P.ballWhite} />
      <rect x="3" y="4" width="6" height="1" fill={P.ballWhite} />
      <rect x="2" y="5" width="8" height="5" fill={P.ballWhite} />
      <rect x="3" y="10" width="6" height="1" fill={P.ballShade} />
      <rect x="5" y="11" width="4" height="1" fill={P.ballShade} />
      {/* patch */}
      <rect x="4" y="6" width="3" height="3" fill={P.ink} />
      {/* motion lines */}
      <rect x="10" y="4" width="3" height="1" fill={P.gold} opacity="0.7" />
      <rect x="11" y="6" width="4" height="1" fill={P.gold} opacity="0.8" />
      <rect x="10" y="8" width="3" height="1" fill={P.gold} opacity="0.7" />
    </svg>
  ),
  referee: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* head */}
      <rect x="6" y="1" width="4" height="3" fill={P.bronzeLight} />
      {/* body / jersey */}
      <rect x="5" y="4" width="6" height="1" fill={P.ink} />
      <rect x="5" y="5" width="6" height="5" fill={P.inkSoft} />
      <rect x="7" y="5" width="2" height="5" fill={P.ink} />
      {/* legs */}
      <rect x="5" y="10" width="2" height="4" fill={P.ink} />
      <rect x="9" y="10" width="2" height="4" fill={P.ink} />
      {/* raised arm + card */}
      <rect x="11" y="3" width="1" height="4" fill={P.bronzeLight} />
      <rect x="11" y="2" width="2" height="3" fill={P.gold} />
    </svg>
  ),
  crowd: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* back row heads */}
      <rect x="2" y="4" width="2" height="3" fill={P.ribbonBlue} />
      <rect x="5" y="3" width="2" height="4" fill={P.ribbonRed} />
      <rect x="8" y="4" width="2" height="3" fill={P.gold} />
      <rect x="11" y="3" width="2" height="4" fill={P.green} />
      {/* banner band */}
      <rect x="1" y="7" width="14" height="2" fill={P.goldLight} opacity="0.7" />
      {/* front row heads */}
      <rect x="3" y="9" width="2" height="3" fill={P.ribbonRed} />
      <rect x="6" y="8" width="2" height="4" fill={P.green} />
      <rect x="9" y="9" width="2" height="3" fill={P.ribbonBlue} />
      <rect x="12" y="8" width="2" height="4" fill={P.gold} />
      {/* terrace base */}
      <rect x="0" y="12" width="16" height="2" fill={P.standDark} />
    </svg>
  ),
  podium: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* 2nd place (left, silver) */}
      <rect x="1" y="8" width="4" height="1" fill={P.silverLight} />
      <rect x="1" y="9" width="4" height="6" fill={P.silver} />
      <rect x="2" y="10" width="2" height="3" fill={P.silverLight} />
      {/* 1st place (centre, gold) */}
      <rect x="6" y="4" width="4" height="1" fill={P.goldLight} />
      <rect x="6" y="5" width="4" height="10" fill={P.gold} />
      <rect x="7" y="7" width="1" height="4" fill={P.goldLight} />
      {/* 3rd place (right, bronze) */}
      <rect x="11" y="10" width="4" height="1" fill={P.bronzeLight} />
      <rect x="11" y="11" width="4" height="4" fill={P.bronze} />
      <rect x="12" y="12" width="2" height="2" fill={P.bronzeLight} />
    </svg>
  ),
  boot: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* ankle + upper */}
      <rect x="9" y="4" width="4" height="2" fill={P.ink} />
      <rect x="3" y="6" width="10" height="1" fill={P.ink} />
      <rect x="2" y="7" width="11" height="1" fill={P.inkSoft} />
      <rect x="1" y="8" width="12" height="2" fill={P.ink} />
      {/* accent stripe */}
      <rect x="6" y="7" width="4" height="1" fill={P.gold} />
      {/* sole */}
      <rect x="1" y="10" width="13" height="1" fill={P.ballWhite} />
      {/* studs */}
      <rect x="2" y="11" width="1" height="1" fill={P.ballShade} />
      <rect x="5" y="11" width="1" height="1" fill={P.ballShade} />
      <rect x="8" y="11" width="1" height="1" fill={P.ballShade} />
      <rect x="11" y="11" width="1" height="1" fill={P.ballShade} />
    </svg>
  ),
  jersey: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* sleeves */}
      <rect x="1" y="3" width="4" height="2" fill={P.ribbonRed} />
      <rect x="11" y="3" width="4" height="2" fill={P.ribbonRed} />
      <rect x="1" y="5" width="2" height="2" fill={P.ribbonRed} />
      <rect x="13" y="5" width="2" height="2" fill={P.ribbonRed} />
      {/* shoulders + body */}
      <rect x="4" y="3" width="8" height="1" fill={P.ribbonRed} />
      <rect x="4" y="4" width="8" height="9" fill={P.ribbonRed} />
      {/* collar */}
      <rect x="6" y="3" width="4" height="1" fill={P.white} />
      <rect x="7" y="4" width="2" height="1" fill={P.white} />
      {/* number */}
      <rect x="7" y="6" width="2" height="1" fill={P.white} />
      <rect x="7" y="6" width="1" height="4" fill={P.white} />
      <rect x="7" y="9" width="2" height="1" fill={P.white} />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* pole */}
      <rect x="3" y="0" width="1" height="1" fill={P.gold} />
      <rect x="3" y="1" width="1" height="15" fill={P.standDark} />
      {/* checkered flag */}
      <rect x="4" y="2" width="2" height="2" fill={P.ink} />
      <rect x="6" y="2" width="2" height="2" fill={P.ballWhite} />
      <rect x="8" y="2" width="2" height="2" fill={P.ink} />
      <rect x="10" y="2" width="2" height="2" fill={P.ballWhite} />
      <rect x="4" y="4" width="2" height="2" fill={P.ballWhite} />
      <rect x="6" y="4" width="2" height="2" fill={P.ink} />
      <rect x="8" y="4" width="2" height="2" fill={P.ballWhite} />
      <rect x="10" y="4" width="2" height="2" fill={P.ink} />
      <rect x="4" y="6" width="2" height="2" fill={P.ink} />
      <rect x="6" y="6" width="2" height="2" fill={P.ballWhite} />
      <rect x="8" y="6" width="2" height="2" fill={P.ink} />
      <rect x="10" y="6" width="2" height="2" fill={P.ballWhite} />
    </svg>
  ),
  cards: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* red card (behind, tilted right) */}
      <rect x="8" y="3" width="5" height="1" fill={P.ribbonRed} />
      <rect x="8" y="4" width="6" height="8" fill={P.ribbonRed} />
      <rect x="13" y="5" width="1" height="6" fill="#a8392d" />
      {/* yellow card (front, tilted left) */}
      <rect x="3" y="4" width="6" height="9" fill={P.gold} />
      <rect x="3" y="4" width="1" height="9" fill={P.goldLight} />
      <rect x="8" y="5" width="1" height="8" fill={P.goldDark} />
    </svg>
  ),
  fireworks: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* bright core */}
      <rect x="7" y="7" width="2" height="2" fill={P.goldLight} />
      {/* cardinal rays */}
      <rect x="7" y="2" width="2" height="2" fill={P.gold} />
      <rect x="7" y="12" width="2" height="2" fill={P.gold} />
      <rect x="2" y="7" width="2" height="2" fill={P.gold} />
      <rect x="12" y="7" width="2" height="2" fill={P.gold} />
      {/* diagonal sparks */}
      <rect x="3" y="3" width="2" height="2" fill={P.ribbonRed} />
      <rect x="11" y="3" width="2" height="2" fill={P.ribbonBlue} />
      <rect x="3" y="11" width="2" height="2" fill={P.green} />
      <rect x="11" y="11" width="2" height="2" fill={P.ribbonRed} />
      {/* inner glints */}
      <rect x="5" y="5" width="1" height="1" fill={P.white} />
      <rect x="10" y="5" width="1" height="1" fill={P.white} />
      <rect x="5" y="10" width="1" height="1" fill={P.white} />
      <rect x="10" y="10" width="1" height="1" fill={P.white} />
    </svg>
  ),
  confetti: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      <rect x="2" y="1" width="2" height="2" fill={P.ribbonRed} />
      <rect x="7" y="2" width="2" height="2" fill={P.gold} />
      <rect x="12" y="1" width="2" height="2" fill={P.ribbonBlue} />
      <rect x="4" y="5" width="2" height="2" fill={P.green} />
      <rect x="10" y="6" width="2" height="2" fill={P.ribbonRed} />
      <rect x="1" y="8" width="2" height="2" fill={P.gold} />
      <rect x="13" y="9" width="2" height="2" fill={P.green} />
      <rect x="6" y="9" width="2" height="2" fill={P.ribbonBlue} />
      <rect x="3" y="12" width="2" height="2" fill={P.gold} />
      <rect x="9" y="13" width="2" height="2" fill={P.ribbonRed} />
      <rect x="12" y="13" width="2" height="2" fill={P.ribbonBlue} />
    </svg>
  ),
};

const animationFor = (name: PixelArtName): string => {
  switch (name) {
    case 'trophy':
      return 'pixel-art--glow';
    case 'star':
    case 'medal-gold':
    case 'medal-silver':
    case 'medal-bronze':
      return 'pixel-art--bounce';
    case 'goal':
    case 'fireworks':
    case 'confetti':
      return 'pixel-art--celebrate';
    default:
      return 'pixel-art--pulse';
  }
};

export const PixelArt: FC<PixelArtProps> = ({
  name,
  size = 32,
  className = '',
  animated = false,
}) => {
  const animationClass = animated ? animationFor(name) : '';

  return (
    <div
      className={`pixel-art pixel-art--${name} ${animationClass} ${className}`}
      style={{ '--pixel-art-size': `${size}px` } as CSSProperties}
      role="img"
      aria-label={name}
    >
      {spriteMap[name]}
    </div>
  );
};
