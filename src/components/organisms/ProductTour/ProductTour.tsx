import { type Driver, driver, type DriveStep } from 'driver.js';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import 'driver.js/dist/driver.css';
import './ProductTour.css';

export interface TourStepConfig {
  /** CSS selector for the element to highlight */
  element: string;
  /** Popover title (rendered in Press Start 2P) */
  title: string;
  /** Popover body text */
  description: string;
  /** Optional side for popover positioning */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Optional alignment */
  align?: 'start' | 'center' | 'end';
}

export interface UseProductTourOptions {
  /** Unique tour identifier for persistence tracking */
  tourId: string;
  /** Ordered array of tour steps */
  steps: TourStepConfig[];
  /** Called when the tour completes (all steps finished) */
  onComplete?: () => void;
  /** Called when the user closes the tour early */
  onClose?: () => void;
  /** Optional button label overrides (i18n) */
  buttons?: {
    next?: string;
    previous?: string;
    done?: string;
    progress?: string;
  };
}

export interface UseProductTourReturn {
  /** Start the tour (ignores completion flag). Safe to call multiple times. */
  start: () => void;
  /** Stop the tour if running. */
  stop: () => void;
  /** Reset the completion flag for this tour. */
  reset: () => void;
  /** Whether the tour has been marked completed in this browser. */
  isCompleted: boolean;
}

function isTourCompleted(tourId: string): boolean {
  try {
    return localStorage.getItem(`tour_completed_${tourId}`) === 'true';
  } catch {
    return false;
  }
}

function markTourCompleted(tourId: string): void {
  try {
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
  } catch {
    // storage unavailable
  }
}

export function resetTour(tourId: string): void {
  try {
    localStorage.removeItem(`tour_completed_${tourId}`);
  } catch {
    // storage unavailable
  }
}

/**
 * Hook that wraps driver.js with persistence, i18n button labels, and a manual
 * start API. Filters out steps whose target element is not present in the DOM
 * at start time so a single tour definition can cover empty/populated states.
 */
export function useProductTour({
  tourId,
  steps,
  onComplete,
  onClose,
  buttons,
}: UseProductTourOptions): UseProductTourReturn {
  const driverRef = useRef<Driver | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => isTourCompleted(tourId));

  const stop = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (typeof document === 'undefined') return;

    const liveSteps: DriveStep[] = steps
      .filter((step) => {
        try {
          return Boolean(document.querySelector(step.element));
        } catch {
          return false;
        }
      })
      .map((step) => ({
        element: step.element,
        popover: {
          title: step.title,
          description: step.description,
          side: step.side || 'bottom',
          align: step.align || 'center',
        },
      }));

    if (liveSteps.length === 0) return;

    driverRef.current?.destroy();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      popoverClass: 'driver-pixel-popover',
      steps: liveSteps,
      nextBtnText: buttons?.next,
      prevBtnText: buttons?.previous,
      doneBtnText: buttons?.done,
      progressText: buttons?.progress,
      onHighlightStarted: (element) => {
        if (!element) return;
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      },
      onCloseClick: () => {
        driverRef.current?.destroy();
        onClose?.();
      },
      onNextClick: (_element, _step, opts) => {
        const isLast = opts.state.activeIndex === liveSteps.length - 1;
        if (isLast) {
          markTourCompleted(tourId);
          setIsCompleted(true);
          onComplete?.();
          driverRef.current?.destroy();
        } else {
          driverRef.current?.moveNext();
        }
      },
      onDestroyed: () => {
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [tourId, steps, onComplete, onClose, buttons]);

  const reset = useCallback(() => {
    resetTour(tourId);
    setIsCompleted(false);
  }, [tourId]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  return { start, stop, reset, isCompleted };
}

export interface ProductTourProps extends UseProductTourOptions {
  /** Optional class name for the trigger wrapper */
  className?: string;
  /** If true, the tour starts automatically on mount (when not already completed) */
  autoStart?: boolean;
}

export const ProductTour: FC<ProductTourProps> = ({
  tourId,
  steps,
  onComplete,
  onClose,
  buttons,
  className = '',
  autoStart = false,
}) => {
  const { start, isCompleted } = useProductTour({ tourId, steps, onComplete, onClose, buttons });

  useEffect(() => {
    if (!autoStart || isCompleted) return;
    const timer = setTimeout(() => start(), 1000);
    return () => clearTimeout(timer);
  }, [autoStart, isCompleted, start]);

  if (isCompleted && !autoStart) return null;

  return <div className={`product-tour ${className}`} data-tour-id={tourId} />;
};
