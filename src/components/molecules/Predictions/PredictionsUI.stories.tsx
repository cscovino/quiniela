import type { Meta, StoryObj } from '@storybook/react-vite';

import { PredictionsFeedback, PredictionsNavigation, PredictionsProgress } from './PredictionsUI';

const meta = {
  component: PredictionsProgress,
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionsProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressManySteps: Story = {
  render: () => (
    <PredictionsProgress
      stepCounter="Step 4 of 12"
      deadlineInfo={{
        deadline: new Date('2026-06-15'),
        state: 'before',
        label: 'Deadline passed',
      }}
    />
  ),
};

export const ProgressFewSteps: Story = {
  render: () => (
    <PredictionsProgress
      stepCounter="Step 2 of 4"
      deadlineInfo={{
        deadline: new Date('2026-06-15'),
        state: 'before',
        label: 'Deadline passed',
      }}
    />
  ),
};

export const ProgressFirstStep: Story = {
  render: () => <PredictionsProgress stepCounter="Step 1 of 4" />,
};

export const ProgressLastStep: Story = {
  render: () => (
    <PredictionsProgress
      stepCounter="Step 4 of 4"
      deadlineInfo={{
        deadline: new Date('2026-06-15'),
        state: 'passed',
        label: 'Deadline passed',
      }}
    />
  ),
};

export const FeedbackSuccess: Story = {
  render: () => (
    <PredictionsFeedback feedback={{ type: 'success', message: 'Group A predictions saved!' }} />
  ),
};

export const FeedbackError: Story = {
  render: () => (
    <PredictionsFeedback
      feedback={{ type: 'error', message: 'Failed to save predictions. Please try again.' }}
    />
  ),
};

export const FeedbackNone: Story = {
  render: () => <PredictionsFeedback feedback={null} />,
};

const navTranslations = {
  buttonBack: 'Back to List',
  buttonNext: 'Next',
  buttonFinish: 'Finish',
  stepsNavLabel: 'Prediction steps',
  stepTooltipEdit: 'Not yet completed',
  stepTooltipCompleted: 'Completed',
};

const navTranslationsWithFinish = {
  buttonBack: 'Back to List',
  buttonNext: 'Next Step',
  buttonFinish: 'Finish',
  stepsNavLabel: 'Prediction steps',
  stepTooltipEdit: 'Not yet completed',
  stepTooltipCompleted: 'Completed',
};

const mockSteps = [
  { id: 'group-a', label: 'Group A', isComplete: true, kind: 'group' as const },
  { id: 'group-b', label: 'Group B', isComplete: true, kind: 'group' as const },
  { id: 'group-c', label: 'Group C', isComplete: true, kind: 'group' as const },
  { id: 'r32', label: 'Round of 32', isComplete: false, kind: 'knockout-round' as const },
  { id: 'qf', label: 'Quarterfinals', isComplete: false, kind: 'knockout-round' as const },
  { id: 'sf', label: 'Semifinals', isComplete: false, kind: 'knockout-round' as const },
  { id: 'final', label: 'Final', isComplete: false, kind: 'final-positions' as const },
];

export const NavigationMiddleStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={3}
      totalSteps={7}
      translations={navTranslations}
      steps={mockSteps}
      onStepClick={() => {}}
    />
  ),
};

export const NavigationSubmitting: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={3}
      totalSteps={7}
      isSubmitting={true}
      translations={navTranslations}
      steps={mockSteps}
      onStepClick={() => {}}
    />
  ),
};

export const NavigationLastStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={6}
      totalSteps={7}
      translations={navTranslationsWithFinish}
      steps={mockSteps}
      onStepClick={() => {}}
    />
  ),
};

export const NavigationCannotAdvance: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={false}
      currentStep={1}
      totalSteps={7}
      translations={navTranslations}
      steps={mockSteps}
      onStepClick={() => {}}
    />
  ),
};

export const NavigationFirstStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={0}
      totalSteps={7}
      translations={navTranslations}
      steps={mockSteps}
      onStepClick={() => {}}
    />
  ),
};