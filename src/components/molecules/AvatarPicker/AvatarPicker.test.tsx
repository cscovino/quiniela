import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AVATAR_PRESETS } from '@utils/avatar-presets';

import type { AvatarPickerTranslations } from './AvatarPicker';
import { AvatarPicker } from './AvatarPicker';

const enTranslations: Required<AvatarPickerTranslations> = {
  skinLabel: 'Skin',
  hairLabel: 'Hair',
  hairColorLabel: 'Hair Color',
  clothingLabel: 'Clothing',
  clothingColorLabel: 'Clothing Color',
  glassesLabel: 'Glasses',
  glassesNone: 'None',
  randomize: 'Randomize',
  randomizeAria: 'Randomize avatar',
  swatchColorAria: '{trait} color {color}',
  swatchStyleAria: '{trait} style {n}',
};

const esTranslations: Required<AvatarPickerTranslations> = {
  skinLabel: 'Piel',
  hairLabel: 'Cabello',
  hairColorLabel: 'Color de cabello',
  clothingLabel: 'Ropa',
  clothingColorLabel: 'Color de ropa',
  glassesLabel: 'Lentes',
  glassesNone: 'Ninguno',
  randomize: 'Aleatorio',
  randomizeAria: 'Avatar aleatorio',
  swatchColorAria: '{trait} color {color}',
  swatchStyleAria: '{trait} estilo {n}',
};

const defaultValue = {
  seed: 'test-seed-123',
  options: {
    skinColor: AVATAR_PRESETS.skinColor[0],
    hair: AVATAR_PRESETS.hair[0],
    hairColor: AVATAR_PRESETS.hairColor[0],
    clothing: AVATAR_PRESETS.clothing[0],
    clothingColor: AVATAR_PRESETS.clothingColor[0],
    glasses: AVATAR_PRESETS.glasses[0],
  },
};

describe('AvatarPicker', () => {
  describe('SC#1 — six radiogroups', () => {
    it('renders 6 radiogroup elements with the correct aria-labels', () => {
      render(
        <AvatarPicker
          value={defaultValue}
          onChange={() => {}}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      const groups = screen.getAllByRole('radiogroup');
      expect(groups).toHaveLength(6);

      const labels = ['Skin', 'Hair', 'Hair Color', 'Clothing', 'Clothing Color', 'Glasses'];
      labels.forEach((label) => {
        expect(screen.getByRole('radiogroup', { name: label })).toBeInTheDocument();
      });
    });
  });

  describe('SC#2 — color chip fires onChange with bare hex', () => {
    it('clicking first skinColor chip fires onChange with bare hex (no #)', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <AvatarPicker
          value={defaultValue}
          onChange={handleChange}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      // First skinColor preset is '8d5524' — bare hex, no #
      const firstSkinColorChip = screen.getByRole('radio', {
        name: /Skin color 8d5524/i,
      });
      await user.click(firstSkinColorChip);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ skinColor: '8d5524' }),
        }),
      );
      // Ensure value written is bare hex, not #-prefixed
      const calledWith = handleChange.mock.calls[0][0];
      expect(calledWith.options.skinColor).toBe('8d5524');
      expect(calledWith.options.skinColor.startsWith('#')).toBe(false);
    });
  });

  describe('SC#3 — glasses None chip fires onChange with glasses === undefined', () => {
    it('clicking None chip fires onChange with glasses undefined', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <AvatarPicker
          value={defaultValue}
          onChange={handleChange}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      const noneChip = screen.getByRole('radio', { name: /Glasses None/i });
      await user.click(noneChip);

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0][0];
      expect(calledWith.options.glasses).toBeUndefined();
      expect(
        'glasses' in calledWith.options ? calledWith.options.glasses : 'missing',
      ).toBeUndefined();
    });

    it('None chip shows aria-checked=true when glasses is undefined', () => {
      render(
        <AvatarPicker
          value={{ ...defaultValue, options: { ...defaultValue.options, glasses: undefined } }}
          onChange={() => {}}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      const noneChip = screen.getByRole('radio', { name: /Glasses None/i });
      expect(noneChip).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Randomize button', () => {
    it('clicking Randomize fires onRandomize', async () => {
      const user = userEvent.setup();
      const handleRandomize = vi.fn();

      render(
        <AvatarPicker
          value={defaultValue}
          onChange={() => {}}
          onRandomize={handleRandomize}
          translations={enTranslations}
        />,
      );

      const randomizeBtn = screen.getByRole('button', { name: /Randomize avatar/i });
      await user.click(randomizeBtn);

      expect(handleRandomize).toHaveBeenCalledTimes(1);
    });
  });

  describe('Selected chip state', () => {
    it('currently selected chip has aria-checked=true and --selected class', () => {
      render(
        <AvatarPicker
          value={defaultValue}
          onChange={() => {}}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      // skinColor[0] is '8d5524' — should be selected
      const selectedChip = screen.getByRole('radio', { name: /Skin color 8d5524/i });
      expect(selectedChip).toHaveAttribute('aria-checked', 'true');
      expect(selectedChip).toHaveClass('avatar-picker__chip--selected');

      // skinColor[1] is 'a86540' — should NOT be selected
      const unselectedChip = screen.getByRole('radio', { name: /Skin color a86540/i });
      expect(unselectedChip).toHaveAttribute('aria-checked', 'false');
      expect(unselectedChip).not.toHaveClass('avatar-picker__chip--selected');
    });

    it('style chip corresponding to current value has aria-checked=true', () => {
      render(
        <AvatarPicker
          value={defaultValue}
          onChange={() => {}}
          onRandomize={() => {}}
          translations={enTranslations}
        />,
      );

      // hair[0] is 'short01', style index 1
      const selectedHairChip = screen.getByRole('radio', { name: /Hair style 1$/i });
      expect(selectedHairChip).toHaveAttribute('aria-checked', 'true');
      expect(selectedHairChip).toHaveClass('avatar-picker__chip--selected');
    });
  });

  describe('SC#6 — labels from translations (Spanish)', () => {
    it('renders Spanish labels and no English labels leak', () => {
      render(
        <AvatarPicker
          value={defaultValue}
          onChange={() => {}}
          onRandomize={() => {}}
          translations={esTranslations}
        />,
      );

      // Spanish trait labels appear
      expect(screen.getByRole('radiogroup', { name: 'Piel' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Cabello' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Color de cabello' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Ropa' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Color de ropa' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Lentes' })).toBeInTheDocument();

      // Spanish None label appears
      expect(screen.getByRole('radio', { name: /Lentes Ninguno/i })).toBeInTheDocument();

      // No English labels in DOM
      expect(screen.queryByRole('radiogroup', { name: 'Skin' })).not.toBeInTheDocument();
      expect(screen.queryByRole('radiogroup', { name: 'Hair' })).not.toBeInTheDocument();
      expect(screen.queryByRole('radiogroup', { name: 'Glasses' })).not.toBeInTheDocument();
      expect(screen.queryByText('None')).not.toBeInTheDocument();
      expect(screen.queryByText('Randomize')).not.toBeInTheDocument();
    });
  });
});
