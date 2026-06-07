import type { TourStepConfig } from './ProductTour';

export const PREDICTOR_MANAGEMENT_TOUR_ID = 'predictor-management';
export const RANKINGS_TOUR_ID = 'rankings-explainer';

export interface PredictorManagementTourTranslations {
  welcomeTitle: string;
  welcomeDescription: string;
  createTitle: string;
  createDescription: string;
  cardTitle: string;
  cardDescription: string;
  editTitle: string;
  editDescription: string;
  deleteTitle: string;
  deleteDescription: string;
}

export interface PredictionWizardTourTranslations {
  sectionTitle: string;
  sectionDescription: string;
  navigationTitle: string;
  navigationDescription: string;
  submitTitle: string;
  submitDescription: string;
}

export interface RankingsTourTranslations {
  boardTitle: string;
  boardDescription: string;
  positionTitle: string;
  positionDescription: string;
  userTitle: string;
  userDescription: string;
  badgesTitle: string;
  badgesDescription: string;
  pointsTitle: string;
  pointsDescription: string;
  todayTitle: string;
  todayDescription: string;
  accuracyTitle: string;
  accuracyDescription: string;
  streakTitle: string;
  streakDescription: string;
  matchesTitle: string;
  matchesDescription: string;
}

/**
 * Tour covering the predictor list lifecycle:
 *   1. Welcome / list area
 *   2. Create button
 *   3. Predictor card (click avatar to enter prediction wizard)
 *   4. Edit profile (avatar + favourite team)
 *   5. Delete predictor
 *
 * Steps targeting card-level elements use `data-tour` attributes set on the
 * first predictor card; missing-element steps are skipped automatically by
 * `useProductTour` so the same tour works in empty / populated states.
 */
export function buildPredictorManagementTour(
  t: PredictorManagementTourTranslations,
): TourStepConfig[] {
  return [
    {
      element: '[data-tour="predictor-list"]',
      title: t.welcomeTitle,
      description: t.welcomeDescription,
      side: 'bottom',
    },
    {
      element: '[data-tour="predictor-create"]',
      title: t.createTitle,
      description: t.createDescription,
      side: 'top',
    },
    {
      element: '[data-tour="predictor-card"]',
      title: t.cardTitle,
      description: t.cardDescription,
      side: 'bottom',
    },
    {
      element: '[data-tour="predictor-edit"]',
      title: t.editTitle,
      description: t.editDescription,
      side: 'top',
    },
    {
      element: '[data-tour="predictor-delete"]',
      title: t.deleteTitle,
      description: t.deleteDescription,
      side: 'top',
    },
  ];
}

export function buildPredictionWizardTour(t: PredictionWizardTourTranslations): TourStepConfig[] {
  return [
    {
      element: '.predictions-template__section',
      title: t.sectionTitle,
      description: t.sectionDescription,
      side: 'bottom',
    },
    {
      element: '.predictions-template__navigation',
      title: t.navigationTitle,
      description: t.navigationDescription,
      side: 'top',
    },
    {
      element: '.predictions-template__nav-btn--primary',
      title: t.submitTitle,
      description: t.submitDescription,
      side: 'top',
    },
  ];
}

/**
 * Tour walking through every part of a ranking row. Each step targets a
 * `data-tour` attribute that only the first row exposes, so the popover
 * highlights one specific section at a time. Steps whose target element is
 * not in the DOM (e.g. a row without today's points, badges, streak, or
 * today's match predictions) are filtered out automatically by
 * `useProductTour.start()`.
 */
export function buildRankingsTour(t: RankingsTourTranslations): TourStepConfig[] {
  return [
    {
      element: '[data-tour="rankings-list"]',
      title: t.boardTitle,
      description: t.boardDescription,
      side: 'bottom',
    },
    {
      element: '[data-tour="ranking-position"]',
      title: t.positionTitle,
      description: t.positionDescription,
      side: 'right',
    },
    {
      element: '[data-tour="ranking-user"]',
      title: t.userTitle,
      description: t.userDescription,
      side: 'bottom',
    },
    {
      element: '[data-tour="ranking-badges"]',
      title: t.badgesTitle,
      description: t.badgesDescription,
      side: 'top',
    },
    {
      element: '[data-tour="ranking-points"]',
      title: t.pointsTitle,
      description: t.pointsDescription,
      side: 'top',
    },
    {
      element: '[data-tour="ranking-today"]',
      title: t.todayTitle,
      description: t.todayDescription,
      side: 'top',
    },
    {
      element: '[data-tour="ranking-accuracy"]',
      title: t.accuracyTitle,
      description: t.accuracyDescription,
      side: 'top',
    },
    {
      element: '[data-tour="ranking-streak"]',
      title: t.streakTitle,
      description: t.streakDescription,
      side: 'top',
    },
    {
      element: '[data-tour="ranking-matches"]',
      title: t.matchesTitle,
      description: t.matchesDescription,
      side: 'left',
    },
  ];
}
