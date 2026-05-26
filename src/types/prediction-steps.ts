import type { ReactNode } from 'react';

export type PredictionStepKind = 'group' | 'knockout-round' | 'final-positions' | 'best-players';

export interface PredictionStepModel {
  id: string;
  kind: PredictionStepKind;
  label: string;
  description: string;
  isComplete: boolean;
  canAdvance?: boolean;
  content: ReactNode;
  onSubmit: () => Promise<void>;
}

export interface PredictionStepContext {
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  submittedSteps: Set<number>;
  markSubmitted: (index: number) => void;
  feedback: { type: 'success' | 'error'; message: string } | null;
  setFeedback: (feedback: { type: 'success' | 'error'; message: string } | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}
