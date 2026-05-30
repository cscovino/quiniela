import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { Predictor } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';

import './PredictorEditor.css';

const EMOJI_OPTIONS = [
  '⚽',
  '🏆',
  '🥅',
  '🎯',
  '⭐',
  '🔥',
  '🇦🇷',
  '🇧🇷',
  '🇩🇪',
  '🇫🇷',
  '🇪🇸',
  '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  '🇵🇹',
  '🇮🇹',
  '🇲🇽',
  '🇺🇸',
  '🇨🇦',
  '🇯🇵',
  '🦁',
  '🐉',
  '🦅',
  '🐺',
  '🦊',
  '🐻',
];

const COLOR_OPTIONS = [
  '#E63946',
  '#2D6A4F',
  '#06D6A0',
  '#7B2D8E',
  '#F4A261',
  '#D4AF37',
  '#1D3557',
  '#457B9D',
  '#A8DADC',
  '#E76F51',
  '#264653',
  '#6A0572',
];

export interface PredictorEditorProps {
  mode: 'create' | 'edit';
  predictor?: Predictor;
  teams?: { fifaCode: string; name: string }[];
  onSave: (data: {
    name: string;
    avatar: { bgColor: string; emoji: string };
    favouriteTeamId?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  translations?: {
    createTitle?: string;
    editTitle?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    emojiLabel?: string;
    colorLabel?: string;
    favouriteTeamLabel?: string;
    noFavouriteTeam?: string;
    save?: string;
    cancel?: string;
    nameRequired?: string;
    emojiAria?: string;
    colorAria?: string;
  };
}

const t = {
  createTitle: 'New prediction',
  editTitle: 'Edit prediction',
  nameLabel: 'Name',
  namePlaceholder: 'Enter predictor name',
  emojiLabel: 'Emoji',
  colorLabel: 'Color',
  favouriteTeamLabel: 'Favorite Team',
  noFavouriteTeam: 'No favorite',
  save: 'Save',
  cancel: 'Cancel',
  nameRequired: 'Name is required',
  emojiAria: 'Emoji {emoji}',
  colorAria: 'Color {color}',
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
  const [selectedEmoji, setSelectedEmoji] = useState(predictor?.avatar?.emoji || EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(
    predictor?.avatar?.bgColor || COLOR_OPTIONS[0],
  );
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
      avatar: { bgColor: selectedColor, emoji: selectedEmoji },
      favouriteTeamId: favouriteTeamId || undefined,
    });
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

      <div className="predictor-editor__field">
        <span className="predictor-editor__label">{labels.emojiLabel}</span>
        <div
          className="predictor-editor__emoji-grid"
          role="radiogroup"
          aria-label={labels.emojiLabel}
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`predictor-editor__emoji-btn ${selectedEmoji === emoji ? 'predictor-editor__emoji-btn--selected' : ''}`}
              onClick={() => setSelectedEmoji(emoji)}
              aria-pressed={selectedEmoji === emoji}
              aria-label={labels.emojiAria.replace('{emoji}', emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="predictor-editor__field">
        <span className="predictor-editor__label">{labels.colorLabel}</span>
        <div
          className="predictor-editor__color-grid"
          role="radiogroup"
          aria-label={labels.colorLabel}
        >
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              className={`predictor-editor__color-swatch ${selectedColor === color ? 'predictor-editor__color-swatch--selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-pressed={selectedColor === color}
              aria-label={labels.colorAria.replace('{color}', color)}
            />
          ))}
        </div>
      </div>

      <div className="predictor-editor__preview">
        <div
          className="predictor-editor__preview-avatar"
          style={{ backgroundColor: selectedColor }}
        >
          <span className="predictor-editor__preview-emoji">{selectedEmoji}</span>
        </div>
        <Typography variant="body">{name || labels.namePlaceholder}</Typography>
      </div>

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
