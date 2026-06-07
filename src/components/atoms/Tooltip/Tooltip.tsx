import type { CSSProperties, FC, ReactNode } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import './Tooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
  /** Accessible label for the trigger. Defaults to `content`. */
  label?: string;
  /**
   * Optional data-tour attribute exposed on the wrapper element so the product
   * tour can target specific tooltip triggers (e.g. ranking-row stat cells).
   */
  'data-tour'?: string;
}

// Gap between trigger and bubble, and minimum margin from the viewport edge (px).
const GAP = 8;
const MARGIN = 8;

/**
 * Tooltip that works with mouse, keyboard AND touch:
 * - desktop: shows on hover/focus
 * - mobile: tap shows it; tapping elsewhere (or scrolling / Escape) dismisses it
 *
 * The bubble uses `position: fixed` with coordinates measured from the trigger,
 * so it is never clipped by an ancestor with `overflow: hidden/auto` (e.g. the
 * horizontally-scrollable ranking row), and it is clamped to stay on screen.
 */
export const Tooltip: FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
  label,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => {
    setVisible(false);
    setBox(null);
  }, []);

  // Measure the rendered bubble and place it relative to the trigger, clamped to
  // the viewport. Runs after the (hidden) bubble mounts so we know its size.
  useEffect(() => {
    if (!visible) return;
    const anchor = wrapperRef.current?.getBoundingClientRect();
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const { width: w, height: h } = tip.getBoundingClientRect();

    let top: number;
    let left: number;
    if (position === 'bottom') {
      top = anchor.bottom + GAP;
      left = anchor.left + anchor.width / 2 - w / 2;
    } else if (position === 'left') {
      top = anchor.top + anchor.height / 2 - h / 2;
      left = anchor.left - GAP - w;
    } else if (position === 'right') {
      top = anchor.top + anchor.height / 2 - h / 2;
      left = anchor.right + GAP;
    } else {
      top = anchor.top - GAP - h;
      left = anchor.left + anchor.width / 2 - w / 2;
    }

    left = Math.max(MARGIN, Math.min(left, window.innerWidth - w - MARGIN));
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - h - MARGIN));
    setBox({ top, left });
  }, [visible, position]);

  // While open, dismiss on an outside tap, on scroll, or on resize.
  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) hide();
    };
    const onReflow = () => hide();
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [visible, hide]);

  // Hidden until measured, so it never flashes at the wrong spot.
  const style: CSSProperties = box
    ? { top: `${box.top}px`, left: `${box.left}px` }
    : { visibility: 'hidden' };

  return (
    <div
      ref={wrapperRef}
      className={`tooltip-wrapper ${className}`}
      tabIndex={0}
      role="button"
      aria-label={label ?? content}
      aria-describedby={visible && box ? tooltipId : undefined}
      {...rest}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        // Show on tap/click. A tap also fires mouseenter, so toggling here would
        // immediately re-hide it; we open on interaction and dismiss elsewhere.
        e.stopPropagation();
        show();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide();
      }}
    >
      {children}
      {visible && (
        <span
          ref={tipRef}
          id={tooltipId}
          className={`tooltip tooltip--${position}`}
          role="tooltip"
          style={style}
        >
          {content}
        </span>
      )}
    </div>
  );
};
