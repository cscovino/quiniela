export type KnockoutSlotSource =
  | { from: 'group'; groupId: string; position: number }
  | {
      from: 'best-third';
      matrixSlot: 'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87';
      eligibleGroups: string[];
    }
  | { from: 'winner-of'; matchSlug: string }
  | { from: 'loser-of'; matchSlug: string };

export interface KnockoutMatchSlot {
  slotId: string;
  source: KnockoutSlotSource;
}

export interface BracketEntry {
  home: KnockoutMatchSlot;
  away: KnockoutMatchSlot;
}

export const BRACKET_MAP: Record<string, BracketEntry> = {
  'r32-1': {
    home: { slotId: 'r32-1-home', source: { from: 'group', groupId: 'group-a', position: 2 } },
    away: { slotId: 'r32-1-away', source: { from: 'group', groupId: 'group-b', position: 2 } },
  },
  'r32-2': {
    home: { slotId: 'r32-2-home', source: { from: 'group', groupId: 'group-e', position: 1 } },
    away: {
      slotId: 'r32-2-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M74',
        eligibleGroups: ['group-a', 'group-b', 'group-c', 'group-d', 'group-f'],
      },
    },
  },
  'r32-3': {
    home: { slotId: 'r32-3-home', source: { from: 'group', groupId: 'group-f', position: 1 } },
    away: { slotId: 'r32-3-away', source: { from: 'group', groupId: 'group-c', position: 2 } },
  },
  'r32-4': {
    home: { slotId: 'r32-4-home', source: { from: 'group', groupId: 'group-c', position: 1 } },
    away: { slotId: 'r32-4-away', source: { from: 'group', groupId: 'group-f', position: 2 } },
  },
  'r32-5': {
    home: { slotId: 'r32-5-home', source: { from: 'group', groupId: 'group-i', position: 1 } },
    away: {
      slotId: 'r32-5-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M77',
        eligibleGroups: ['group-c', 'group-d', 'group-f', 'group-g', 'group-h'],
      },
    },
  },
  'r32-6': {
    home: { slotId: 'r32-6-home', source: { from: 'group', groupId: 'group-e', position: 2 } },
    away: { slotId: 'r32-6-away', source: { from: 'group', groupId: 'group-i', position: 2 } },
  },
  'r32-7': {
    home: { slotId: 'r32-7-home', source: { from: 'group', groupId: 'group-a', position: 1 } },
    away: {
      slotId: 'r32-7-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M79',
        eligibleGroups: ['group-c', 'group-e', 'group-f', 'group-h', 'group-i'],
      },
    },
  },
  'r32-8': {
    home: { slotId: 'r32-8-home', source: { from: 'group', groupId: 'group-l', position: 1 } },
    away: {
      slotId: 'r32-8-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M80',
        eligibleGroups: ['group-e', 'group-h', 'group-i', 'group-j', 'group-k'],
      },
    },
  },
  'r32-9': {
    home: { slotId: 'r32-9-home', source: { from: 'group', groupId: 'group-d', position: 1 } },
    away: {
      slotId: 'r32-9-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M81',
        eligibleGroups: ['group-b', 'group-e', 'group-f', 'group-i', 'group-j'],
      },
    },
  },
  'r32-10': {
    home: { slotId: 'r32-10-home', source: { from: 'group', groupId: 'group-g', position: 1 } },
    away: {
      slotId: 'r32-10-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M82',
        eligibleGroups: ['group-a', 'group-e', 'group-h', 'group-i', 'group-j'],
      },
    },
  },
  'r32-11': {
    home: { slotId: 'r32-11-home', source: { from: 'group', groupId: 'group-k', position: 2 } },
    away: { slotId: 'r32-11-away', source: { from: 'group', groupId: 'group-l', position: 2 } },
  },
  'r32-12': {
    home: { slotId: 'r32-12-home', source: { from: 'group', groupId: 'group-h', position: 1 } },
    away: { slotId: 'r32-12-away', source: { from: 'group', groupId: 'group-j', position: 2 } },
  },
  'r32-13': {
    home: { slotId: 'r32-13-home', source: { from: 'group', groupId: 'group-b', position: 1 } },
    away: {
      slotId: 'r32-13-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M85',
        eligibleGroups: ['group-e', 'group-f', 'group-g', 'group-i', 'group-j'],
      },
    },
  },
  'r32-14': {
    home: { slotId: 'r32-14-home', source: { from: 'group', groupId: 'group-j', position: 1 } },
    away: { slotId: 'r32-14-away', source: { from: 'group', groupId: 'group-h', position: 2 } },
  },
  'r32-15': {
    home: { slotId: 'r32-15-home', source: { from: 'group', groupId: 'group-k', position: 1 } },
    away: {
      slotId: 'r32-15-away',
      source: {
        from: 'best-third',
        matrixSlot: 'M87',
        eligibleGroups: ['group-d', 'group-e', 'group-i', 'group-j', 'group-l'],
      },
    },
  },
  'r32-16': {
    home: { slotId: 'r32-16-home', source: { from: 'group', groupId: 'group-d', position: 2 } },
    away: { slotId: 'r32-16-away', source: { from: 'group', groupId: 'group-g', position: 2 } },
  },
  'r16-1': {
    home: { slotId: 'r16-1-home', source: { from: 'winner-of', matchSlug: 'r32-2' } },
    away: { slotId: 'r16-1-away', source: { from: 'winner-of', matchSlug: 'r32-5' } },
  },
  'r16-2': {
    home: { slotId: 'r16-2-home', source: { from: 'winner-of', matchSlug: 'r32-1' } },
    away: { slotId: 'r16-2-away', source: { from: 'winner-of', matchSlug: 'r32-3' } },
  },
  'r16-3': {
    home: { slotId: 'r16-3-home', source: { from: 'winner-of', matchSlug: 'r32-4' } },
    away: { slotId: 'r16-3-away', source: { from: 'winner-of', matchSlug: 'r32-6' } },
  },
  'r16-4': {
    home: { slotId: 'r16-4-home', source: { from: 'winner-of', matchSlug: 'r32-7' } },
    away: { slotId: 'r16-4-away', source: { from: 'winner-of', matchSlug: 'r32-8' } },
  },
  'r16-5': {
    home: { slotId: 'r16-5-home', source: { from: 'winner-of', matchSlug: 'r32-11' } },
    away: { slotId: 'r16-5-away', source: { from: 'winner-of', matchSlug: 'r32-12' } },
  },
  'r16-6': {
    home: { slotId: 'r16-6-home', source: { from: 'winner-of', matchSlug: 'r32-9' } },
    away: { slotId: 'r16-6-away', source: { from: 'winner-of', matchSlug: 'r32-10' } },
  },
  'r16-7': {
    home: { slotId: 'r16-7-home', source: { from: 'winner-of', matchSlug: 'r32-14' } },
    away: { slotId: 'r16-7-away', source: { from: 'winner-of', matchSlug: 'r32-16' } },
  },
  'r16-8': {
    home: { slotId: 'r16-8-home', source: { from: 'winner-of', matchSlug: 'r32-13' } },
    away: { slotId: 'r16-8-away', source: { from: 'winner-of', matchSlug: 'r32-15' } },
  },
  'qf-1': {
    home: { slotId: 'qf-1-home', source: { from: 'winner-of', matchSlug: 'r16-1' } },
    away: { slotId: 'qf-1-away', source: { from: 'winner-of', matchSlug: 'r16-2' } },
  },
  'qf-2': {
    home: { slotId: 'qf-2-home', source: { from: 'winner-of', matchSlug: 'r16-5' } },
    away: { slotId: 'qf-2-away', source: { from: 'winner-of', matchSlug: 'r16-6' } },
  },
  'qf-3': {
    home: { slotId: 'qf-3-home', source: { from: 'winner-of', matchSlug: 'r16-3' } },
    away: { slotId: 'qf-3-away', source: { from: 'winner-of', matchSlug: 'r16-4' } },
  },
  'qf-4': {
    home: { slotId: 'qf-4-home', source: { from: 'winner-of', matchSlug: 'r16-7' } },
    away: { slotId: 'qf-4-away', source: { from: 'winner-of', matchSlug: 'r16-8' } },
  },
  'sf-1': {
    home: { slotId: 'sf-1-home', source: { from: 'winner-of', matchSlug: 'qf-1' } },
    away: { slotId: 'sf-1-away', source: { from: 'winner-of', matchSlug: 'qf-2' } },
  },
  'sf-2': {
    home: { slotId: 'sf-2-home', source: { from: 'winner-of', matchSlug: 'qf-3' } },
    away: { slotId: 'sf-2-away', source: { from: 'winner-of', matchSlug: 'qf-4' } },
  },
  'third-place': {
    home: { slotId: 'tp-home', source: { from: 'loser-of', matchSlug: 'sf-1' } },
    away: { slotId: 'tp-away', source: { from: 'loser-of', matchSlug: 'sf-2' } },
  },
  final: {
    home: { slotId: 'f-home', source: { from: 'winner-of', matchSlug: 'sf-1' } },
    away: { slotId: 'f-away', source: { from: 'winner-of', matchSlug: 'sf-2' } },
  },
};
