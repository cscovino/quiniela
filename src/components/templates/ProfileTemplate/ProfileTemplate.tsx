import React from 'react';
import { NavBar, type NavBarProps } from '@organisms/NavBar/NavBar';
import { UserProfile, type UserProfileProps } from '@organisms/UserProfile/UserProfile';
import {
  NotificationPanel,
  type NotificationPanelProps,
} from '@organisms/NotificationPanel/NotificationPanel';
import { Typography } from '@atoms/Typography/Typography';
import './ProfileTemplate.css';

export interface ProfileTemplateProps {
  navProps: NavBarProps;
  userProfile: UserProfileProps;
  notifications?: NotificationPanelProps['notifications'];
  onNotificationDismiss?: (id: string) => void;
  className?: string;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  navProps,
  userProfile,
  notifications = [],
  onNotificationDismiss,
  className = '',
}) => {
  return (
    <div className={`profile-template ${className}`}>
      <NavBar {...navProps} />

      <main className="profile-template__content">
        <header className="profile-template__header">
          <Typography variant="h1">My Profile</Typography>
        </header>

        <div className="profile-template__grid">
          <section className="profile-template__profile">
            <UserProfile {...userProfile} />
          </section>

          {notifications.length > 0 && (
            <section className="profile-template__notifications">
              <Typography variant="h3">Notifications</Typography>
              <NotificationPanel notifications={notifications} onDismiss={onNotificationDismiss} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
