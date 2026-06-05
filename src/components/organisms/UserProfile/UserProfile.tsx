import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';
import { EditProfileForm } from '@molecules/EditProfileForm';
import { useAuthStore } from '@store/auth-store';

import './UserProfile.css';

import { Avatar } from '@/components/atoms/Avatar';

export interface UserProfileProps {
  translations: {
    editProfile?: string;
    cancelEditing?: string;
    saveProfile?: string;
    saving?: string;
    profileSaved?: string;
    profileSaveError?: string;
    displayNameLabel?: string;
    displayNameRequired?: string;
    avatarUrlLabel?: string;
    avatarUrlHint?: string;
  };
  className?: string;
}

export const UserProfile: FC<UserProfileProps> = ({ translations, className = '' }) => {
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || '';
  const avatarUrl = user.avatarUrl;

  return (
    <div className={`user-profile ${className}`}>
      {editing ? (
        <EditProfileForm
          translations={{
            displayNameLabel: translations?.displayNameLabel || 'Display Name',
            displayNameRequired: translations?.displayNameRequired || 'Display name is required',
            avatarUrlLabel: translations?.avatarUrlLabel || 'Avatar URL',
            avatarUrlHint: translations?.avatarUrlHint || '',
            saveProfile: translations?.saveProfile || 'Save Changes',
            cancelEditing: translations?.cancelEditing || 'Cancel',
            saving: translations?.saving || 'Saving...',
            profileSaved: translations?.profileSaved || 'Profile updated',
            profileSaveError: translations?.profileSaveError || 'Failed to update profile',
          }}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="user-profile__header">
            <Avatar src={avatarUrl} name={displayName} />
            <div className="user-profile__info">
              <Typography variant="h2">{displayName}</Typography>
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
            {translations.editProfile}
          </Button>
        </>
      )}
    </div>
  );
};
