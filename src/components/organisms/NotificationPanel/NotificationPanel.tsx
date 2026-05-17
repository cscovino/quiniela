import React from 'react';
import { Typography } from '@atoms/Typography/Typography';
import { Icon } from '@atoms/Icon/Icon';
import { Button } from '@atoms/Button/Button';
import './NotificationPanel.css';

export type NotificationType = 'match_start' | 'result_posted' | 'badge_earned' | 'ranking_change';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
  translations: {
    noNotifications: string;
    notificationsHeader: (count: number) => string;
    clearAll: string;
  };
  className?: string;
}

const typeIcons: Record<NotificationType, string> = {
  match_start: 'clock',
  result_posted: 'check',
  badge_earned: 'trophy',
  ranking_change: 'chart',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  translations,
  className = '',
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className={`notification-panel notification-panel--empty ${className}`}>
        <Icon name="bell" size={32} />
        <Typography variant="body">{translations.noNotifications}</Typography>
      </div>
    );
  }

  return (
    <div className={`notification-panel ${className}`}>
      <div className="notification-panel__header">
        <Typography variant="h4">{translations.notificationsHeader(unreadCount)}</Typography>
        {onClearAll && notifications.length > 0 && (
          <Button variant="secondary" size="sm" onClick={onClearAll}>
            {translations.clearAll}
          </Button>
        )}
      </div>

      <div className="notification-panel__list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-panel__item ${!notification.read ? 'notification-panel__item--unread' : ''}`}
            onClick={() => onMarkAsRead?.(notification.id)}
            role="button"
            tabIndex={0}
          >
            <div className="notification-panel__icon">
              <Icon name={typeIcons[notification.type]} size={20} />
            </div>
            <div className="notification-panel__content">
              <Typography variant="small" className="notification-panel__title">
                {notification.title}
              </Typography>
              <Typography variant="small" className="notification-panel__message">
                {notification.message}
              </Typography>
              <Typography variant="caption" className="notification-panel__time">
                {notification.createdAt.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
