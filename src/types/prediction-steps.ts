import type { ReactNode } from 'react';

export type PredictionStepKind = 'group' | 'knockout-round' | 'third-place' | 'final-positions' | 'best-players';

export interface ThirdPlacedTeam {
  rank: number;
  teamId: string;
  teamName: string;
  groupLetter: string;
  points: number;
  goalDifference: number;
  goalsScored: number;
  advancing: boolean;
  bracketSlotLabel?: string; // e.g. "Match 74" if advancing
  bracketMatchSlug?: string; // e.g. "r32-m3" if advancing
}

export type DeadlineState = 'before' | 'passed';

export interface DeadlineInfo {
  deadline: Date;
  state: DeadlineState;
  label: string;
  countdownLabel?: string;
}

// Reported by a step's form up to the wizard so a single "Next" button can both
// persist the current step and advance. `submit` saves whatever is currently
// entered; `canAdvance` gates the Next button.
export interface PredictionStepState {
  canAdvance: boolean;
  submit: () => Promise<void>;
}

export type RegisterStepState = (state: PredictionStepState) => void;

export interface PredictionStepModel {
  id: string;
  kind: PredictionStepKind;
  label: string;
  description: string;
  isComplete: boolean;
  canAdvance?: boolean;
  deadline?: Date;
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
