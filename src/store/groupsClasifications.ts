import create from 'zustand';

import { GroupsNames, GroupsClasifications, GroupClasifications } from '@/types';

interface GroupsClasificationsState {
  groupsClasifications: GroupsClasifications;
  setGroupsClasification: (groupsClasification: GroupsClasifications) => void;
  setGroupClasification: (group: GroupsNames, groupClasification: GroupClasifications) => void;
  clearGroupClasification: (group: GroupsNames) => void;
  clearGroupsClasifications: () => void;
}

export const defaultGroupsClasifications: GroupsClasifications = {
  A: {},
  B: {},
  C: {},
  D: {},
  E: {},
  F: {},
  G: {},
  H: {},
};

export const useGroupsClasificationsStore = create<GroupsClasificationsState>()((set) => ({
  groupsClasifications: { ...defaultGroupsClasifications },
  setGroupsClasification: (groupsClasifications) => set(() => ({ groupsClasifications })),
  setGroupClasification: (group, groupClasification) => {
    set((state) => ({
      groupsClasifications: { ...state.groupsClasifications, [group]: groupClasification },
    }));
  },
  clearGroupClasification: (group) => {
    set((state) => ({
      groupsClasifications: {
        ...state.groupsClasifications,
        [group]: defaultGroupsClasifications[group],
      },
    }));
  },
  clearGroupsClasifications: () => {
    set({ groupsClasifications: { ...defaultGroupsClasifications } });
  },
}));
