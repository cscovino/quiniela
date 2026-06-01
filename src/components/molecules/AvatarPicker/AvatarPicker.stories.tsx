import type { Meta, StoryObj } from '@storybook/react-vite';

import { AVATAR_PRESETS } from '@utils/avatar-presets';

import { AvatarPicker } from './AvatarPicker';

const defaultValue = {
  seed: 'story-seed-abc123',
  options: {
    skinColor: AVATAR_PRESETS.skinColor[2],
    hair: AVATAR_PRESETS.hair[1],
    hairColor: AVATAR_PRESETS.hairColor[0],
    clothing: AVATAR_PRESETS.clothing[0],
    clothingColor: AVATAR_PRESETS.clothingColor[1],
    glasses: AVATAR_PRESETS.glasses[0],
  },
};

const randomizedValue = {
  seed: 'story-seed-xyz789',
  options: {
    skinColor: AVATAR_PRESETS.skinColor[4],
    hair: AVATAR_PRESETS.hair[3],
    hairColor: AVATAR_PRESETS.hairColor[6],
    clothing: AVATAR_PRESETS.clothing[3],
    clothingColor: AVATAR_PRESETS.clothingColor[5],
    glasses: undefined,
  },
};

const meta = {
  component: AvatarPicker,
  tags: ['ai-generated'],
  argTypes: {
    onChange: { action: 'change' },
    onRandomize: { action: 'randomize' },
  },
} satisfies Meta<typeof AvatarPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: defaultValue,
    name: 'Player One',
  },
};

export const Randomized: Story = {
  args: {
    value: randomizedValue,
    name: 'Lucky Draw',
  },
};

// SC#5 manual: verify each trait row scrolls independently and no chip < 44px
// at 360px viewport width; no page horizontal overflow at narrow width.
export const NarrowViewport360px: Story = {
  args: {
    value: defaultValue,
    name: 'Mobile Check',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
      viewports: {
        mobile1: {
          name: '360px (narrow)',
          styles: {
            width: '360px',
            height: '640px',
          },
        },
      },
    },
  },
};
