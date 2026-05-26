import React, { useState } from 'react';
import { Input } from '@atoms/Input/Input';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { useAuthStore } from '@store/auth-store';
import { updateUserProfile } from '@services/auth-helpers';
import './EditProfileForm.css';

export interface EditProfileFormProps {
  translations: {
    displayNameLabel: string;
    displayNameRequired: string;
    avatarUrlLabel: string;
    avatarUrlHint: string;
    favoriteTeamLabel: string;
    favoriteTeamHint: string;
    saveProfile: string;
    cancelEditing: string;
    saving: string;
    profileSaved: string;
    profileSaveError: string;
  };
  onCancel: () => void;
  onSaved: () => void;
  className?: string;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  translations,
  onCancel,
  onSaved,
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [favoriteTeam, setFavoriteTeam] = useState(user?.favoriteTeamId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError(translations.displayNameRequired);
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user!.uid, {
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || null,
        favoriteTeamId: favoriteTeam.trim() || null,
      });
      setUser({
        ...user!,
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        favoriteTeamId: favoriteTeam.trim() || undefined,
      });
      onSaved();
    } catch {
      setError(translations.profileSaveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`edit-profile-form ${className}`}>
      {error && (
        <div className="edit-profile-form__error" role="alert" aria-live="polite">
          <Typography variant="small">{error}</Typography>
        </div>
      )}

      <Input
        type="text"
        label={translations.displayNameLabel}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        autoComplete="name"
      />

      <Input
        type="url"
        label={translations.avatarUrlLabel}
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        helperText={translations.avatarUrlHint}
        autoComplete="url"
      />

      <Input
        type="text"
        label={translations.favoriteTeamLabel}
        value={favoriteTeam}
        onChange={(e) => setFavoriteTeam(e.target.value)}
        helperText={translations.favoriteTeamHint}
      />

      <div className="edit-profile-form__actions">
        <Button type="submit" variant="primary" isLoading={saving}>
          {saving ? translations.saving : translations.saveProfile}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          {translations.cancelEditing}
        </Button>
      </div>
    </form>
  );
};
