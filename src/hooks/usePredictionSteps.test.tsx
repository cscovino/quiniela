import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { predictionService } from '@services/prediction-service';

import { usePredictionSteps } from './usePredictionSteps';

vi.mock('@services/prediction-service', () => ({
  predictionService: {
    getExistingBets: vi.fn(),
    submitBatchMatchBets: vi.fn(),
    submitBatchGroupBets: vi.fn(),
    submitBatchKnockoutBets: vi.fn(),
    submitFinalPhaseBet: vi.fn(),
    submitBestPlayersBet: vi.fn(),
  },
}));

vi.mock('@services/tournament-service', () => ({
  tournamentService: {
    getMatches: vi.fn().mockResolvedValue([]),
    getTeams: vi.fn().mockResolvedValue([]),
    getGroups: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn((selector: (s: { user: { uid: string } | null }) => unknown) =>
    selector({ user: { uid: 'test-uid' } }),
  ),
}));

const minimalTranslations = {
  stepFinalPhase: 'Final Phase',
  stepFinalPhaseDesc: 'Predict the final phase',
  stepBestPlayers: 'Best Players',
  stepBestPlayersDesc: 'Predict best players',
  captchaError: 'CAPTCHA error',
  feedback: {
    submittedCount: '{count} submitted',
    finalPhaseSubmitted: 'Final phase submitted',
    bestPlayersSubmitted: 'Best players submitted',
    submitFailed: 'Submit failed',
  },
};

describe('usePredictionSteps — bets async cycle', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    warnSpy.mockRestore();
  });

  // HT — hook real-cycle test
  it('sets betsStatus to error and calls console.warn when getExistingBets rejects', async () => {
    vi.mocked(predictionService.getExistingBets).mockImplementation(() =>
      Promise.reject(new Error('fetch failed')),
    );

    const { result } = renderHook(() =>
      usePredictionSteps(minimalTranslations, 'en', 'predictor-id-123'),
    );

    await waitFor(() => expect(result.current.betsStatus).toBe('error'));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[usePredictionSteps]'),
      expect.any(Error),
    );
  });

  // hook real-cycle test — success path (the branch that produces non-zero points)
  it('transitions betsStatus to loaded after getExistingBets resolves with saved bets', async () => {
    vi.mocked(predictionService.getExistingBets).mockResolvedValue({
      matchBets: new Map([['match-a1', { home: 2, away: 1 }]]),
      knockoutBets: new Map(),
      groupBets: new Map([['group-a', ['MEX', 'RSA', 'KOR', 'CZE']]]),
      finalPhase: null,
      bestPlayers: null,
    });

    const { result } = renderHook(() =>
      usePredictionSteps(minimalTranslations, 'en', 'predictor-id-123'),
    );

    await waitFor(() => expect(result.current.betsStatus).toBe('loaded'));
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // null-predictor path must resolve, not sit in perpetual loading
  it('resolves betsStatus to loaded when no predictor is selected', async () => {
    vi.mocked(predictionService.getExistingBets).mockClear();
    const { result } = renderHook(() => usePredictionSteps(minimalTranslations, 'en', null));

    await waitFor(() => expect(result.current.betsStatus).toBe('loaded'));
    expect(predictionService.getExistingBets).not.toHaveBeenCalled();
  });
});
