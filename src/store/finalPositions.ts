import create from 'zustand';

import { FinalPositions, Countries } from '@/types';

interface FinalPositionsState {
  finalPositions: FinalPositions;
  setFinalPosition: (position: keyof FinalPositions, team: Countries) => void;
  clearFinalPositions: () => void;
}

export const defaultFinalPositions: FinalPositions = {
  first: undefined,
  second: undefined,
  third: undefined,
  fourth: undefined,
};

export const useFinalPositionsStore = create<FinalPositionsState>()((set) => ({
  finalPositions: { ...defaultFinalPositions },
  setFinalPosition: (position, team) => {
    set((state) => ({ finalPositions: { ...state.finalPositions, [position]: team } }));
  },
  clearFinalPositions: () => set({ finalPositions: { ...defaultFinalPositions } }),
}));
