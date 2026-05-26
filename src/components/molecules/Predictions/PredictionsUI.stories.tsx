import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PredictionsProgress,
  PredictionsFeedback,
  PredictionsNavigation,
} from './PredictionsUI';

const meta = {
  component: PredictionsProgress,
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionsProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManySteps: Story = {
  render: () => (
    <PredictionsProgress
      stepLabels={[
        'Group A',
        'Group B',
        'Group C',
        'Group D',
        'Group E',
        'Group F',
        'Group G',
        'Group H',
        'Round of 16',
        'Quarterfinals',
        'Semifinals',
        'Final',
      ]}
      currentStep={3}
      submittedSteps={new Set([0, 1, 2])}
      stepCounter="Step 4 of 12"
    />
  ),
};

export const FewSteps: Story = {
  render: () => (
    <PredictionsProgress
      stepLabels={['Matches', 'Groups', 'Knockout', 'Best Players']}
      currentStep={1}
      submittedSteps={new Set([0])}
      stepCounter="Step 2 of 4"
    />
  ),
};

export const FirstStep: Story = {
  render: () => (
    <PredictionsProgress
      stepLabels={['Matches', 'Groups', 'Knockout', 'Best Players']}
      currentStep={0}
      submittedSteps={new Set()}
      stepCounter="Step 1 of 4"
    />
  ),
};

export const LastStep: Story = {
  render: () => (
    <PredictionsProgress
      stepLabels={['Matches', 'Groups', 'Knockout', 'Best Players']}
      currentStep={3}
      submittedSteps={new Set([0, 1, 2])}
      stepCounter="Step 4 of 4"
    />
  ),
};

export const FeedbackSuccess: Story = {
  render: () => (
    <PredictionsFeedback
      feedback={{ type: 'success', message: 'Group A predictions saved!' }}
    />
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
  submitToAdvance: 'Submit current step to continue',
};

export const NavigationMiddleStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={2}
      totalSteps={5}
      translations={navTranslations}
      submittedSteps={new Set()}
    />
  ),
};

export const NavigationLastStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={4}
      totalSteps={5}
      translations={navTranslations}
      submittedSteps={new Set()}
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
      totalSteps={5}
      translations={navTranslations}
      submittedSteps={new Set()}
    />
  ),
};

export const NavigationSubmittedStep: Story = {
  render: () => (
    <PredictionsNavigation
      onBack={() => {}}
      onNext={() => {}}
      canAdvance={true}
      currentStep={2}
      totalSteps={5}
      translations={navTranslations}
      submittedSteps={new Set([2])}
    />
  ),
};