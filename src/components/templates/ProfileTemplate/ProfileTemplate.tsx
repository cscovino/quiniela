import React from 'react';
import { UserProfile, type UserProfileProps } from '@organisms/UserProfile/UserProfile';
import {
  NotificationPanel,
  type NotificationPanelProps,
} from '@organisms/NotificationPanel/NotificationPanel';
import { Typography } from '@atoms/Typography/Typography';
import './ProfileTemplate.css';

export interface ProfileTemplateProps {
  userProfile: Omit<UserProfileProps, 'translations'>;
  notifications?: NotificationPanelProps['notifications'];
  translations: {
    title: string;
    notificationsTitle: (count: number) => string;
    userProfile: UserProfileProps['translations'];
    notifications: NotificationPanelProps['translations'];
  };
  onNotificationDismiss?: (id: string) => void;
  className?: string;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  userProfile,
  notifications = [],
  translations,
  onNotificationDismiss,
  className = '',
}) => {
  return (
    <div className={`profile-template ${className}`}>
      <main className="profile-template__content">
        <header className="profile-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <section className="profile-template__user">
          <UserProfile {...userProfile} translations={translations.userProfile} />
        </section>

        {notifications.length > 0 && (
          <section className="profile-template__notifications">
            <Typography variant="h2">
              {translations.notificationsTitle(notifications.length)}
            </Typography>
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={onNotificationDismiss}
              translations={translations.notifications}
            />
          </section>
        )}
      </main>
    </div>
  );
};
