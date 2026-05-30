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
}

// Gap between the trigger and the tooltip, in px (matches --space-2).
const GAP = 8;

/**
 * Tooltip that works with mouse, keyboard AND touch:
 * - desktop: shows on hover/focus
 * - mobile: tap toggles it; tapping elsewhere (or scrolling) dismisses it
 *
 * The bubble is rendered with `position: fixed` (coordinates computed from the
 * trigger) so it is never clipped by an ancestor with `overflow: hidden/auto`
 * (e.g. the horizontally-scrollable ranking row).
 */
export const Tooltip: FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
  label,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const place = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (position === 'bottom') setCoords({ top: r.bottom + GAP, left: r.left + r.width / 2 });
    else if (position === 'left') setCoords({ top: r.top + r.height / 2, left: r.left - GAP });
    else if (position === 'right') setCoords({ top: r.top + r.height / 2, left: r.right + GAP });
    else setCoords({ top: r.top - GAP, left: r.left + r.width / 2 }); // top
  }, [position]);

  const show = useCallback(() => {
    place();
    setVisible(true);
  }, [place]);
  const hide = useCallback(() => setVisible(false), []);

  // While open, dismiss on an outside tap/click, on scroll, or on resize.
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

  const style: CSSProperties = { top: `${coords.top}px`, left: `${coords.left}px` };

  return (
    <div
      ref={wrapperRef}
      className={`tooltip-wrapper ${className}`}
      tabIndex={0}
      role="button"
      aria-label={label ?? content}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        // Show on tap/click. A tap also fires mouseenter, so toggling here would
        // immediately re-hide it; instead we open on interaction and dismiss via
        // outside tap / scroll / Escape.
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
