import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPanel } from './NotificationPanel';

const translations = {
  noNotifications: 'No notifications yet',
  notificationsHeader: (count: number) => `Notifications (${count})`,
  clearAll: 'Clear All',
};

const mockNotifications = [
  {
    id: '1',
    type: 'badge_earned' as const,
    title: 'Badge Earned!',
    message: 'You earned the On Fire badge!',
    read: false,
    createdAt: new Date('2026-06-20T16:00:00Z'),
  },
  {
    id: '2',
    type: 'result_posted' as const,
    title: 'Match Result',
    message: 'Argentina 2 - 1 France',
    read: true,
    createdAt: new Date('2026-06-20T18:00:00Z'),
  },
];

describe('NotificationPanel', () => {
  it('renders notifications', () => {
    render(<NotificationPanel notifications={mockNotifications} translations={translations} />);
    expect(screen.getByText('Badge Earned!')).toBeInTheDocument();
    expect(screen.getByText('Match Result')).toBeInTheDocument();
  });

  it('shows unread count', () => {
    render(<NotificationPanel notifications={mockNotifications} translations={translations} />);
    expect(screen.getByText('Notifications (1)')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationPanel notifications={[]} translations={translations} />);
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when notification clicked', async () => {
    const user = userEvent.setup();
    const handleMarkAsRead = vi.fn();
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkAsRead={handleMarkAsRead}
        translations={translations}
      />,
    );

    const items = screen.getAllByRole('button');
    await user.click(items[0]);
    expect(handleMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('calls onClearAll when clear button clicked', async () => {
    const user = userEvent.setup();
    const handleClearAll = vi.fn();
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onClearAll={handleClearAll}
        translations={translations}
      />,
    );

    await user.click(screen.getByText('Clear All'));
    expect(handleClearAll).toHaveBeenCalled();
  });

  it('hides clear all button when onClearAll not provided', () => {
    render(<NotificationPanel notifications={mockNotifications} translations={translations} />);
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });
});
