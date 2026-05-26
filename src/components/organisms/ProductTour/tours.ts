import type { TourStepConfig } from './ProductTour';

export const PREDICTION_WIZARD_TOUR: TourStepConfig[] = [
  {
    element: '.predictions-template__progress',
    title: 'Prediction Stages',
    description:
      'Work through each stage: group matches, knockout rounds, final phase, and best players. Complete each step to advance.',
    side: 'bottom',
  },
  {
    element: '.predictions-template__section',
    title: 'Make Your Predictions',
    description:
      "Enter score predictions for each match. Green fields indicate you've filled all required predictions for this stage.",
    side: 'bottom',
  },
  {
    element: '.predictions-template__navigation',
    title: 'Navigate Steps',
    description:
      'Use Next/Back to move between stages. Each stage must be submitted before you can advance to the next.',
    side: 'top',
  },
  {
    element: '.predictions-template__nav-btn--primary',
    title: 'Submit & Advance',
    description:
      'Click "Submit" to lock in your predictions for this stage. You can return to view them later.',
    side: 'top',
  },
];

export const RANKINGS_TOUR: TourStepConfig[] = [
  {
    element: '.rankings-table',
    title: 'Rankings Board',
    description:
      'See how all predictors rank. Points are calculated based on correct score and result predictions.',
    side: 'bottom',
  },
  {
    element: '.rankings-table th:first-child',
    title: 'Your Position',
    description:
      'Find yourself in the rankings. Your predictor name and points update after each match round.',
    side: 'right',
  },
];

export const FIRST_PREDICTOR_TOUR: TourStepConfig[] = [
  {
    element: '.predictor-list',
    title: 'Your Predictors',
    description:
      'Create one or more predictors for the tournament. Each predictor makes its own set of predictions.',
    side: 'bottom',
  },
  {
    element: '.predictor-list button',
    title: 'Create a Predictor',
    description:
      'Click here to create your first predictor. Give it a name and customize your avatar.',
    side: 'bottom',
  },
];
