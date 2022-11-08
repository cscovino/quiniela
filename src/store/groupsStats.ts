import create from 'zustand';

import { GroupsStats, GroupsNames, GroupStats } from '@/types';

interface GroupsStatsState {
  groupsStats: GroupsStats;
  setGroupStats: (group: GroupsNames, groupResults: GroupStats) => void;
  clearGroupStats: (group: GroupsNames, groupResults: GroupStats) => void;
  clearGroupsStats: () => void;
}

export const defaultGroupsStats: GroupsStats = {
  A: {
    QAT: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    ECU: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    SEN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    NED: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  B: {
    ENG: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    IRN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    USA: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    WAL: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  C: {
    ARG: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    KSA: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    MEX: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    POL: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  D: {
    DEN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    TUN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    FRA: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    AUS: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  E: {
    GER: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    JPN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    ESP: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    CRC: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  F: {
    MAR: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    CRO: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    BEL: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    CAN: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  G: {
    BRA: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    SRB: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    SUI: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    CMR: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
  H: {
    POR: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    GHA: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    URU: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
    KOR: {
      pts: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    },
  },
};

export const useGroupsStatsStore = create<GroupsStatsState>()((set) => ({
  groupsStats: { ...defaultGroupsStats },
  setGroupStats: (group, groupResults) => {
    set((state) => ({ groupsStats: { ...state.groupsStats, [group]: groupResults } }));
  },
  clearGroupStats: (group) => {
    set((state) => ({ groupsStats: { ...state.groupsStats, [group]: defaultGroupsStats[group] } }));
  },
  clearGroupsStats: () => set({ groupsStats: { ...defaultGroupsStats } }),
}));
