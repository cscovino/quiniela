import React, { useEffect, useRef, useCallback } from 'react';
import { driver, type DriveStep } from 'driver.js';
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

export interface ProductTourProps {
  /** Unique tour identifier for persistence tracking */
  tourId: string;
  /** Ordered array of tour steps */
  steps: TourStepConfig[];
  /** Called when the tour completes (all steps finished) */
  onComplete?: () => void;
  /** Called when the user closes the tour early */
  onClose?: () => void;
  /** Optional class name for the trigger wrapper */
  className?: string;
  /** If true, the tour starts automatically on mount */
  autoStart?: boolean;
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

export const ProductTour: React.FC<ProductTourProps> = ({
  tourId,
  steps,
  onComplete,
  onClose,
  className = '',
  autoStart = false,
}) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const driveSteps: DriveStep[] = steps.map((step) => ({
    element: step.element,
    popover: {
      title: step.title,
      description: step.description,
      side: step.side || 'bottom',
      align: step.align || 'center',
    },
  }));

  const startTour = useCallback(() => {
    if (isTourCompleted(tourId)) return;

    driverRef.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      popoverClass: 'driver-pixel-popover',
      steps: driveSteps,
      onCloseClick: () => {
        onClose?.();
      },
      onNextClick: (_element, step) => {
        if (step.index === driveSteps.length - 1) {
          markTourCompleted(tourId);
          onComplete?.();
        }
      },
      onDestroyed: () => {
        driverRef.current = null;
      },
    });

    driverRef.current.drive();
  }, [tourId, driveSteps, onComplete, onClose]);

  useEffect(() => {
    if (autoStart && !isTourCompleted(tourId)) {
      const timer = setTimeout(() => startTour(), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, tourId, startTour]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  if (isTourCompleted(tourId) && !autoStart) return null;

  return <div className={`product-tour ${className}`} data-tour-id={tourId} />;
};
