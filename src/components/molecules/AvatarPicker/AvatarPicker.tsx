import type { FC } from 'react';

import type { AvatarOptions, Predictor } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { AVATAR_PRESETS } from '@utils/avatar-presets';

import './AvatarPicker.css';

export interface AvatarPickerTranslations {
  skinLabel?: string;
  hairLabel?: string;
  hairColorLabel?: string;
  clothingLabel?: string;
  clothingColorLabel?: string;
  glassesLabel?: string;
  glassesNone?: string;
  randomize?: string;
  randomizeAria?: string;
  swatchColorAria?: string;
  swatchStyleAria?: string;
  // NEW — optional trait labels:
  eyesLabel?: string;
  eyesColorLabel?: string;
  beardLabel?: string;
  beardNone?: string;
  mouthLabel?: string;
  mouthColorLabel?: string;
  hatLabel?: string;
  hatNone?: string;
  hatColorLabel?: string;
  accessoriesLabel?: string;
  accessoriesNone?: string;
  accessoriesColorLabel?: string;
  glassesColorLabel?: string;
}

export interface AvatarPickerProps {
  value: { seed: string; options: AvatarOptions };
  onChange: (next: { seed: string; options: AvatarOptions }) => void;
  onRandomize: () => void;
  name?: string;
  translations?: AvatarPickerTranslations;
}

const t: Required<AvatarPickerTranslations> = {
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
  // NEW defaults:
  eyesLabel: 'Eyes',
  eyesColorLabel: 'Eye color',
  beardLabel: 'Beard',
  beardNone: 'None',
  mouthLabel: 'Mouth',
  mouthColorLabel: 'Lip color',
  hatLabel: 'Hat',
  hatNone: 'None',
  hatColorLabel: 'Hat color',
  accessoriesLabel: 'Accessories',
  accessoriesNone: 'None',
  accessoriesColorLabel: 'Accessories color',
  glassesColorLabel: 'Glasses color',
};

type ColorTrait =
  | 'skinColor'
  | 'hairColor'
  | 'clothingColor'
  | 'eyesColor'
  | 'mouthColor'
  | 'hatColor'
  | 'accessoriesColor'
  | 'glassesColor';
type StyleTrait =
  | 'hair'
  | 'clothing'
  | 'glasses'
  | 'eyes'
  | 'beard'
  | 'mouth'
  | 'hat'
  | 'accessories';

interface TraitRowDef {
  trait: string;
  label: string;
  type: 'color' | 'style';
}

export const AvatarPicker: FC<AvatarPickerProps> = ({
  value,
  onChange,
  onRandomize,
  name,
  translations = {},
}) => {
  const labels: Required<AvatarPickerTranslations> = { ...t, ...translations };

  const traitRows: TraitRowDef[] = [
    // EXISTING 6:
    { trait: 'skinColor', label: labels.skinLabel, type: 'color' },
    { trait: 'hair', label: labels.hairLabel, type: 'style' },
    { trait: 'hairColor', label: labels.hairColorLabel, type: 'color' },
    { trait: 'clothing', label: labels.clothingLabel, type: 'style' },
    { trait: 'clothingColor', label: labels.clothingColorLabel, type: 'color' },
    { trait: 'glasses', label: labels.glassesLabel, type: 'style' },
    // NEW style axes (optional traits — None chip handled in render):
    { trait: 'eyes', label: labels.eyesLabel, type: 'style' },
    { trait: 'beard', label: labels.beardLabel, type: 'style' },
    { trait: 'mouth', label: labels.mouthLabel, type: 'style' },
    { trait: 'hat', label: labels.hatLabel, type: 'style' },
    { trait: 'accessories', label: labels.accessoriesLabel, type: 'style' },
    // NEW color axes:
    { trait: 'eyesColor', label: labels.eyesColorLabel, type: 'color' },
    { trait: 'mouthColor', label: labels.mouthColorLabel, type: 'color' },
    { trait: 'hatColor', label: labels.hatColorLabel, type: 'color' },
    { trait: 'accessoriesColor', label: labels.accessoriesColorLabel, type: 'color' },
    { trait: 'glassesColor', label: labels.glassesColorLabel, type: 'color' },
  ];

  const previewPredictor: Predictor = {
    id: 'preview',
    userId: '',
    name: name ?? '',
    pixelArt: { seed: value.seed, options: value.options },
  } as Predictor;

  return (
    <div className="avatar-picker">
      <div className="avatar-picker__preview">
        <PredictorAvatar predictor={previewPredictor} size="lg" />
        <Button variant="accent" size="sm" onClick={onRandomize} aria-label={labels.randomizeAria}>
          <Icon name="shuffle" size={16} />
          {labels.randomize}
        </Button>
      </div>

      {traitRows.map(({ trait, label, type }) => {
        const presets = AVATAR_PRESETS[trait as keyof typeof AVATAR_PRESETS] as readonly string[];
        const currentValue = value.options[trait as keyof AvatarOptions];

        return (
          <div key={trait} className="avatar-picker__field">
            <span className="avatar-picker__label">{label}</span>
            <div role="radiogroup" aria-label={label} className="avatar-picker__row">
              {type === 'style' && trait === 'glasses' && (
                <button
                  key="glasses-none"
                  type="button"
                  role="radio"
                  className={`avatar-picker__chip avatar-picker__chip--style${currentValue === undefined ? ' avatar-picker__chip--selected' : ''}`}
                  aria-checked={currentValue === undefined}
                  aria-label={`${label} ${labels.glassesNone}`}
                  onClick={() =>
                    onChange({
                      ...value,
                      options: { ...value.options, glasses: undefined },
                    })
                  }
                >
                  {labels.glassesNone}
                </button>
              )}
              {type === 'color' &&
                presets.map((v) => {
                  const isSelected = currentValue === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      className={`avatar-picker__chip avatar-picker__chip--color${isSelected ? ' avatar-picker__chip--selected' : ''}`}
                      style={{ backgroundColor: `#${v}` }}
                      aria-checked={isSelected}
                      aria-label={labels.swatchColorAria
                        .replace('{trait}', label)
                        .replace('{color}', v)}
                      onClick={() =>
                        onChange({
                          ...value,
                          options: {
                            ...value.options,
                            [trait as ColorTrait]: v,
                          },
                        })
                      }
                    />
                  );
                })}
              {type === 'style' &&
                presets.map((v, i) => {
                  const isSelected = currentValue === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      className={`avatar-picker__chip avatar-picker__chip--style${isSelected ? ' avatar-picker__chip--selected' : ''}`}
                      aria-checked={isSelected}
                      aria-label={labels.swatchStyleAria
                        .replace('{trait}', label)
                        .replace('{n}', String(i + 1))}
                      onClick={() =>
                        onChange({
                          ...value,
                          options: {
                            ...value.options,
                            [trait as StyleTrait]: v,
                          },
                        })
                      }
                    >
                      {v}
                    </button>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
