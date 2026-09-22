import { useNavigate } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../lib/utils';
import { notificationIcon, notificationAccent, timeAgo } from '../../components/notifications/notificationMeta';
import type { AppNotification } from '../../types';

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function handleSelect(notification: AppNotification) {
    if (!notification.read) markRead.mutate(notification._id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.` : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">Nothing here yet — you'll see updates on rooms, maintenance and billing as they happen.</p>
          ) : (
            <ul>
              {notifications.map((notification) => {
                const Icon = notificationIcon[notification.type];
                return (
                  <li key={notification._id} className="border-b border-slate-50 last:border-0">
                    <button
                      type="button"
                      onClick={() => handleSelect(notification)}
                      className={cn(
                        'flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-slate-50',
                        !notification.read && 'bg-indigo-50/40'
                      )}
                    >
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', notificationAccent[notification.type])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                        <p className="text-sm text-slate-500">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{timeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
