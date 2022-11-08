import create from 'zustand';

import { Countries, PlayoffsMatches } from '@/types';

interface PlayoffsMatchesState {
  playoffsMatches: PlayoffsMatches;
  setPlayoffsTeam: (match: string, team: Countries) => void;
  clearPlayoffsMatches: () => void;
}

const matchHelper: { [Key: string]: { match: string; number: string } } = {
  49: { match: '57', number: 'T1' },
  50: { match: '57', number: 'T2' },
  51: { match: '59', number: 'T1' },
  52: { match: '59', number: 'T2' },
  53: { match: '58', number: 'T1' },
  54: { match: '58', number: 'T2' },
  55: { match: '60', number: 'T1' },
  56: { match: '60', number: 'T2' },
  57: { match: '61', number: 'T1' },
  58: { match: '61', number: 'T2' },
  59: { match: '62', number: 'T1' },
  60: { match: '62', number: 'T2' },
  61: { match: 'FINAL', number: 'T1' },
  62: { match: 'FINAL', number: 'T2' },
  P61: { match: 'BRONZE', number: 'T1' },
  P62: { match: 'BRONZE', number: 'T2' },
};

export const defaultPlayoffsMatches: PlayoffsMatches = {
  57: {
    T1: 'G49',
    T2: 'G50',
  },
  58: {
    T1: 'G53',
    T2: 'G54',
  },
  59: {
    T1: 'G52',
    T2: 'G51',
  },
  60: {
    T1: 'G55',
    T2: 'G56',
  },
  61: {
    T1: 'G57',
    T2: 'G58',
  },
  62: {
    T1: 'G59',
    T2: 'G60',
  },
  BRONZE: {
    T1: 'P61',
    T2: 'P62',
  },
  FINAL: {
    T1: 'G61',
    T2: 'G62',
  },
};

export const usePlayoffsMatchesStore = create<PlayoffsMatchesState>()((set) => ({
  playoffsMatches: { ...defaultPlayoffsMatches },
  setPlayoffsTeam: (match, team) => {
    set((state) => ({
      playoffsMatches: {
        ...state.playoffsMatches,
        [matchHelper[match].match]: {
          ...state.playoffsMatches[matchHelper[match].match],
          [matchHelper[match].number]: team,
        },
      },
    }));
  },
  clearPlayoffsMatches: () => set({ playoffsMatches: { ...defaultPlayoffsMatches } }),
}));
