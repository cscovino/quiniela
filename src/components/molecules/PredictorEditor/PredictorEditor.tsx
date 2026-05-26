import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { Input } from '@atoms/Input/Input';
import type { Predictor } from '@app-types/firestore';
import './PredictorEditor.css';

const EMOJI_OPTIONS = [
  '⚽', '🏆', '🥅', '🎯', '⭐', '🔥',
  '🇦🇷', '🇧🇷', '🇩🇪', '🇫🇷', '🇪🇸', '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  '🇵🇹', '🇮🇹', '🇲🇽', '🇺🇸', '🇨🇦', '🇯🇵',
  '🦁', '🐉', '🦅', '🐺', '🦊', '🐻',
];

const COLOR_OPTIONS = [
  '#E63946', '#2D6A4F', '#06D6A0', '#7B2D8E',
  '#F4A261', '#D4AF37', '#1D3557', '#457B9D',
  '#A8DADC', '#E76F51', '#264653', '#6A0572',
];

export interface PredictorEditorProps {
  mode: 'create' | 'edit';
  predictor?: Predictor;
  onSave: (data: { name: string; avatar: { bgColor: string; emoji: string } }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  translations?: {
    createTitle?: string;
    editTitle?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    emojiLabel?: string;
    colorLabel?: string;
    save?: string;
    cancel?: string;
  };
}

const t = {
  createTitle: 'New prediction',
  editTitle: 'Edit prediction',
  nameLabel: 'Name',
  namePlaceholder: 'Enter predictor name',
  emojiLabel: 'Emoji',
  colorLabel: 'Color',
  save: 'Save',
  cancel: 'Cancel',
};

export const PredictorEditor: React.FC<PredictorEditorProps> = ({
  mode,
  predictor,
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
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(null);
    await onSave({
      name: name.trim(),
      avatar: { bgColor: selectedColor, emoji: selectedEmoji },
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
        <div className="predictor-editor__emoji-grid" role="radiogroup" aria-label={labels.emojiLabel}>
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`predictor-editor__emoji-btn ${selectedEmoji === emoji ? 'predictor-editor__emoji-btn--selected' : ''}`}
              onClick={() => setSelectedEmoji(emoji)}
              aria-pressed={selectedEmoji === emoji}
              aria-label={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="predictor-editor__field">
        <span className="predictor-editor__label">{labels.colorLabel}</span>
        <div className="predictor-editor__color-grid" role="radiogroup" aria-label={labels.colorLabel}>
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              className={`predictor-editor__color-swatch ${selectedColor === color ? 'predictor-editor__color-swatch--selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-pressed={selectedColor === color}
              aria-label={`Color ${color}`}
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
