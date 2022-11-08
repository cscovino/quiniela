import create from 'zustand';

import { GroupValues, Match } from '@/types';

const defaultsGroupsResults: GroupValues = {
  'QAT-ECU': {
    QAT: 0,
    ECU: 0,
  },
  'SEN-NED': {
    SEN: 0,
    NED: 0,
  },
  'QAT-SEN': {
    QAT: 0,
    SEN: 0,
  },
  'ECU-NED': {
    ECU: 0,
    NED: 0,
  },
  'QAT-NED': {
    QAT: 0,
    NED: 0,
  },
  'ECU-SEN': {
    ECU: 0,
    SEN: 0,
  },
  'ENG-IRN': {
    ENG: 0,
    IRN: 0,
  },
  'USA-WAL': {
    USA: 0,
    WAL: 0,
  },
  'IRN-WAL': {
    IRN: 0,
    WAL: 0,
  },
  'ENG-USA': {
    ENG: 0,
    USA: 0,
  },
  'ENG-WAL': {
    ENG: 0,
    WAL: 0,
  },
  'IRN-USA': {
    IRN: 0,
    USA: 0,
  },
  'ARG-KSA': {
    ARG: 0,
    KSA: 0,
  },
  'MEX-POL': {
    MEX: 0,
    POL: 0,
  },
  'KSA-POL': {
    KSA: 0,
    POL: 0,
  },
  'ARG-MEX': {
    ARG: 0,
    MEX: 0,
  },
  'ARG-POL': {
    ARG: 0,
    POL: 0,
  },
  'KSA-MEX': {
    KSA: 0,
    MEX: 0,
  },
  'DEN-TUN': {
    DEN: 0,
    TUN: 0,
  },
  'FRA-AUS': {
    FRA: 0,
    AUS: 0,
  },
  'AUS-TUN': {
    AUS: 0,
    TUN: 0,
  },
  'FRA-DEN': {
    FRA: 0,
    DEN: 0,
  },
  'AUS-DEN': {
    AUS: 0,
    DEN: 0,
  },
  'FRA-TUN': {
    FRA: 0,
    TUN: 0,
  },
  'GER-JPN': {
    GER: 0,
    JPN: 0,
  },
  'ESP-CRC': {
    ESP: 0,
    CRC: 0,
  },
  'CRC-JPN': {
    CRC: 0,
    JPN: 0,
  },
  'ESP-GER': {
    ESP: 0,
    GER: 0,
  },
  'ESP-JPN': {
    ESP: 0,
    JPN: 0,
  },
  'CRC-GER': {
    CRC: 0,
    GER: 0,
  },
  'MAR-CRO': {
    MAR: 0,
    CRO: 0,
  },
  'BEL-CAN': {
    BEL: 0,
    CAN: 0,
  },
  'BEL-MAR': {
    BEL: 0,
    MAR: 0,
  },
  'CAN-CRO': {
    CAN: 0,
    CRO: 0,
  },
  'BEL-CRO': {
    BEL: 0,
    CRO: 0,
  },
  'CAN-MAR': {
    CAN: 0,
    MAR: 0,
  },
  'SUI-CMR': {
    SUI: 0,
    CMR: 0,
  },
  'BRA-SRB': {
    BRA: 0,
    SRB: 0,
  },
  'SRB-CMR': {
    SRB: 0,
    CMR: 0,
  },
  'BRA-SUI': {
    BRA: 0,
    SUI: 0,
  },
  'BRA-CMR': {
    BRA: 0,
    CMR: 0,
  },
  'SRB-SUI': {
    SRB: 0,
    SUI: 0,
  },
  'URU-KOR': {
    URU: 0,
    KOR: 0,
  },
  'POR-GHA': {
    POR: 0,
    GHA: 0,
  },
  'GHA-KOR': {
    GHA: 0,
    KOR: 0,
  },
  'POR-URU': {
    POR: 0,
    URU: 0,
  },
  'POR-KOR': {
    POR: 0,
    KOR: 0,
  },
  'GHA-URU': {
    GHA: 0,
    URU: 0,
  },
};

interface GroupsResultsState {
  groupsResults: GroupValues;
  setGroupResults: (groupResults: GroupValues) => void;
  clearGroupsResults: () => void;
}

export const useGroupsResultsStore = create<GroupsResultsState>()((set) => ({
  groupsResults: { ...defaultsGroupsResults },
  setGroupResults: (groupResults) => {
    set((state) => {
      const { groupsResults } = state;
      Object.keys(groupResults).forEach((match) => {
        groupsResults[match as Match] = groupResults[match as Match];
      });
      return { groupsResults };
    });
  },
  clearGroupsResults: () => set({ groupsResults: { ...defaultsGroupsResults } }),
}));
