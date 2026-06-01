import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { AvatarOptions, Predictor } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';
import { AvatarPicker, type AvatarPickerTranslations } from '@molecules/AvatarPicker';
import { randomAvatar } from '@utils/avatar-presets';
import { DEFAULT_OPTIONS } from '@utils/dicebear';

import './PredictorEditor.css';

export interface PredictorEditorProps {
  mode: 'create' | 'edit';
  predictor?: Predictor;
  teams?: { fifaCode: string; name: string }[];
  onSave: (data: {
    name: string;
    pixelArt: { seed: string; options: AvatarOptions };
    favouriteTeamId?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  translations?: {
    createTitle?: string;
    editTitle?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    favouriteTeamLabel?: string;
    noFavouriteTeam?: string;
    save?: string;
    cancel?: string;
    nameRequired?: string;
  } & AvatarPickerTranslations;
}

const t = {
  createTitle: 'New prediction',
  editTitle: 'Edit prediction',
  nameLabel: 'Name',
  namePlaceholder: 'Enter predictor name',
  favouriteTeamLabel: 'Favorite Team',
  noFavouriteTeam: 'No favorite',
  save: 'Save',
  cancel: 'Cancel',
  nameRequired: 'Name is required',
  // AvatarPicker fallback labels (mirrors AvatarPicker in-file `t`)
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

export const PredictorEditor: FC<PredictorEditorProps> = ({
  mode,
  predictor,
  teams,
  onSave,
  onCancel,
  isSubmitting = false,
  translations = {},
}) => {
  const labels = { ...t, ...translations };

  const [name, setName] = useState(predictor?.name || '');
  const [avatar, setAvatar] = useState<{ seed: string; options: AvatarOptions }>(() => {
    if (mode === 'create') {
      return randomAvatar();
    }
    return (
      predictor?.pixelArt ?? {
        seed: predictor?.id ?? crypto.randomUUID(),
        options: { ...DEFAULT_OPTIONS },
      }
    );
  });
  const [favouriteTeamId, setFavouriteTeamId] = useState(predictor?.favouriteTeamId || '');
  const [error, setError] = useState<string | null>(null);

  const sortedTeams = useMemo(() => {
    if (!teams) return [];
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(labels.nameRequired);
      return;
    }
    setError(null);
    await onSave({
      name: name.trim(),
      pixelArt: avatar,
      favouriteTeamId: favouriteTeamId || undefined,
    });
  };

  const pickerTranslations: AvatarPickerTranslations = {
    skinLabel: labels.skinLabel,
    hairLabel: labels.hairLabel,
    hairColorLabel: labels.hairColorLabel,
    clothingLabel: labels.clothingLabel,
    clothingColorLabel: labels.clothingColorLabel,
    glassesLabel: labels.glassesLabel,
    glassesNone: labels.glassesNone,
    randomize: labels.randomize,
    randomizeAria: labels.randomizeAria,
    swatchColorAria: labels.swatchColorAria,
    swatchStyleAria: labels.swatchStyleAria,
  };

  return (
    <div className="predictor-editor">
      <Typography variant="h2">
        {mode === 'create' ? labels.createTitle : labels.editTitle}
      </Typography>

      <div className="predictor-editor__field">
        <label htmlFor="predictor-name" className="predictor-editor__label">
          {labels.nameLabel}
        </label>
        <Input
          id="predictor-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          maxLength={40}
          aria-invalid={!!error}
          aria-describedby={error ? 'predictor-name-error' : undefined}
        />
        {error && (
          <Typography variant="small" className="predictor-editor__error" id="predictor-name-error">
            {error}
          </Typography>
        )}
      </div>

      <AvatarPicker
        value={avatar}
        onChange={setAvatar}
        onRandomize={() => setAvatar(randomAvatar())}
        name={name}
        translations={pickerTranslations}
      />

      {sortedTeams.length > 0 && (
        <div className="predictor-editor__field">
          <span className="predictor-editor__label">{labels.favouriteTeamLabel}</span>
          <select
            className="predictor-editor__select"
            value={favouriteTeamId}
            onChange={(e) => setFavouriteTeamId(e.target.value)}
            aria-label={labels.favouriteTeamLabel}
          >
            <option value="">{labels.noFavouriteTeam}</option>
            {sortedTeams.map((team) => (
              <option key={team.fifaCode} value={team.fifaCode}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="predictor-editor__actions">
        <Button variant="primary" onClick={handleSave} isDisabled={isSubmitting}>
          {labels.save}
        </Button>
        <Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
};
