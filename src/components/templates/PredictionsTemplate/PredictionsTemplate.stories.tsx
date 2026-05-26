import type { Meta, StoryObj } from '@storybook/react-vite';
import { PredictionsTemplate } from './PredictionsTemplate';
import { useAuthStore } from '@store/auth-store';

const meta = {
  component: PredictionsTemplate,
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const translations = {
  title: 'My Predictions',
  noMatches: 'No matches available',
  submitSuccess: 'Predictions saved!',
  submitError: 'Failed to save predictions',
  loginRequired: 'Sign in to make predictions',
  loginButton: 'Sign In',
  loading: 'Loading...',
  stepFinalPhase: 'Final Phase',
  stepFinalPhaseDesc: 'Predict the top 4 teams',
  stepBestPlayers: 'Best Players',
  stepBestPlayersDesc: 'Predict the best goalkeeper and top scorer',
  buttonNext: 'Next',
  buttonBack: 'Back',
  buttonSubmit: 'Submit',
  stepXofY: 'Step {current} of {total}',
  submitToAdvance: 'Submit current step to continue',
  predictedStandings: 'Predicted Standings',
  team: 'Team',
  pts: 'Pts',
  feedback: {
    submittedCount: '{count} predictions submitted',
    finalPhaseSubmitted: 'Final phase predictions saved!',
    bestPlayersSubmitted: 'Best players predictions saved!',
    submitFailed: 'Failed to save. Please try again.',
  },
  predictor: {
    title: 'Predictors',
    select: 'Select',
    create: 'Create New',
    createButton: 'New Predictor',
    namePlaceholder: 'Enter predictor name',
    loading: 'Loading predictors...',
    noPredictors: 'No predictors yet',
    getStarted: 'Get started by creating your first predictor!',
  },
  predictorList: {
    newButton: 'New Prediction',
    progress: 'groups',
    points: 'pts',
    edit: 'Edit',
    delete: 'Delete',
    empty: 'No predictions yet',
    backToPredictors: 'Back to Predictors',
  },
};

export const Loading: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: true, user: null });
      return <PredictionsTemplate translations={translations} />;
    },
  ],
};

export const AuthRequired: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: false, user: null });
      return <PredictionsTemplate translations={translations} />;
    },
  ],
};

export const PredictorListEmpty: Story = {
  decorators: [
    () => {
      useAuthStore.setState({
        isAuthLoading: false,
        user: { uid: 'u1', email: 'user@test.com' },
      });
      return <PredictionsTemplate translations={translations} />;
    },
  ],
};